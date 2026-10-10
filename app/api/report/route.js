import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const REPORT_REASONS = ['SPAM', 'HARASSMENT', 'FAKE_PROFILE', 'INAPPROPRIATE_CONTENT', 'IMPERSONATION', 'SCAM', 'OTHER']
const REPORT_TARGET_TYPES = ['USER', 'PROJECT', 'COMMENT', 'MESSAGE']

// POST /api/report
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const reporterId = session.user.id
    const body = await req.json()
    let { targetType, targetId, reason, details, alsoBlock } = body

    // Validate required fields
    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'targetType, targetId, and reason are required' }, { status: 400 })
    }

    if (!REPORT_TARGET_TYPES.includes(targetType)) {
      return NextResponse.json({ error: `Invalid targetType. Must be one of: ${REPORT_TARGET_TYPES.join(', ')}` }, { status: 400 })
    }

    if (!REPORT_REASONS.includes(reason)) {
      return NextResponse.json({ error: `Invalid reason. Must be one of: ${REPORT_REASONS.join(', ')}` }, { status: 400 })
    }

    // Trim details to 500 chars
    if (typeof details === 'string') {
      details = details.trim().slice(0, 500)
      if (details === '') details = null
    } else {
      details = details || null
    }

    // Resolve reportedUserId server-side
    let reportedUserId = null
    if (targetType === 'USER') {
      const user = await prisma.user.findUnique({ where: { id: targetId } })
      if (!user) return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
      reportedUserId = user.id
    } else if (targetType === 'PROJECT') {
      const project = await prisma.project.findUnique({ where: { id: targetId }, select: { userId: true } })
      if (!project) return NextResponse.json({ error: 'Target project not found' }, { status: 404 })
      reportedUserId = project.userId
    } else if (targetType === 'COMMENT') {
      const comment = await prisma.comment.findUnique({ where: { id: targetId }, select: { userId: true } })
      if (!comment) return NextResponse.json({ error: 'Target comment not found' }, { status: 404 })
      reportedUserId = comment.userId
    } else if (targetType === 'MESSAGE') {
      const message = await prisma.message.findUnique({ where: { id: targetId }, select: { senderId: true } })
      if (!message) return NextResponse.json({ error: 'Target message not found' }, { status: 404 })
      reportedUserId = message.senderId
    }

    // Reject reporting self
    if (reportedUserId === reporterId) {
      return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 })
    }

    // Rate limit: max 10 reports per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await prisma.report.count({
      where: { reporterId, createdAt: { gt: oneHourAgo } },
    })
    if (recentCount >= 10) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
    }

    // Duplicate check
    const duplicate = await prisma.report.findUnique({
      where: {
        reporterId_targetType_targetId: { reporterId, targetType, targetId },
      },
    })
    if (duplicate) {
      return NextResponse.json({ error: "You've already reported this." }, { status: 409 })
    }

    // Validate alsoBlock target if requested
    if (alsoBlock) {
      if (reportedUserId === reporterId) {
        return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 })
      }
      const blockTarget = await prisma.user.findUnique({ where: { id: reportedUserId } })
      if (!blockTarget) {
        return NextResponse.json({ error: 'User to block not found' }, { status: 404 })
      }
    }

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.report.create({
        data: {
          reporterId,
          targetType,
          targetId,
          reportedUserId,
          reason,
          details,
        },
      })

      if (alsoBlock) {
        await tx.block.upsert({
          where: { blockerId_blockedId: { blockerId: reporterId, blockedId: reportedUserId } },
          update: {},
          create: { blockerId: reporterId, blockedId: reportedUserId },
        })

        await tx.connection.deleteMany({
          where: {
            OR: [
              { fromUserId: reporterId, toUserId: reportedUserId },
              { fromUserId: reportedUserId, toUserId: reporterId },
            ],
          },
        })

        await tx.notification.deleteMany({
          where: {
            read: false,
            OR: [{ userId: reporterId }, { userId: reportedUserId }],
          },
        })
      }

      return created
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('POST /api/report error:', error)
    // Handle unique constraint race condition
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "You've already reported this." }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
