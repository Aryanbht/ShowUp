import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/block — block a user
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const myId = session.user.id
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (myId === userId) {
      return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 })
    }

    // Validate target exists
    const target = await prisma.user.findUnique({ where: { id: userId } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already blocked — idempotent success
    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: myId, blockedId: userId } },
    })
    if (existing) {
      return NextResponse.json({ success: true, block: existing, alreadyBlocked: true }, { status: 200 })
    }

    const block = await prisma.$transaction(async (tx) => {
      const created = await tx.block.upsert({
        where: { blockerId_blockedId: { blockerId: myId, blockedId: userId } },
        update: {},
        create: { blockerId: myId, blockedId: userId },
      })

      // Delete all Connection rows between the two (both directions)
      await tx.connection.deleteMany({
        where: {
          OR: [
            { fromUserId: myId, toUserId: userId },
            { fromUserId: userId, toUserId: myId },
          ],
        },
      })

      // Delete unread Notifications between them in both directions
      // Since Notification only has userId (recipient) and no explicit sender field,
      // we delete unread notifications owned by either user.
      await tx.notification.deleteMany({
        where: {
          read: false,
          OR: [{ userId: myId }, { userId: userId }],
        },
      })

      return created
    })

    return NextResponse.json({ success: true, block }, { status: 201 })
  } catch (error) {
    console.error('POST /api/block error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ success: true }, { status: 200 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/block — list users I've blocked
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const myId = session.user.id

    const blocks = await prisma.block.findMany({
      where: { blockerId: myId },
      include: {
        blocked: {
          select: { id: true, name: true, username: true, avatar: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = blocks.map((b) => ({
      id: b.blocked.id,
      name: b.blocked.name,
      username: b.blocked.username,
      image: b.blocked.avatar,
      avatar: b.blocked.avatar,
      createdAt: b.blocked.createdAt,
      blockedAt: b.createdAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/block error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
