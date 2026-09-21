import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/project/[id]/comment
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = params
    const userId = session.user.id
    const { text } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: { userId, projectId, text: text.trim() },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    })

    // Create notification (don't notify yourself)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, title: true },
    })
    const commenter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })

    if (project && project.userId !== userId) {
      await prisma.notification.create({
        data: {
          userId: project.userId,
          type: 'PROJECT_COMMENT',
          message: `${commenter.name} commented on "${project.title}"`,
          link: `/feed`,
        },
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('POST /api/project/[id]/comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
