import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/project/[id]/like - toggle like
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: projectId } = params
    const userId = session.user.id

    const existingLike = await prisma.like.findUnique({
      where: { userId_projectId: { userId, projectId } },
    })

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } })
    } else {
      await prisma.like.create({ data: { userId, projectId } })

      // Create notification (don't notify yourself)
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true, title: true },
      })
      const liker = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      })

      if (project && project.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: project.userId,
            type: 'PROJECT_LIKE',
            message: `${liker.name} liked your project "${project.title}"`,
            link: `/feed`,
          },
        })
      }
    }

    const count = await prisma.like.count({ where: { projectId } })
    return NextResponse.json({ liked: !existingLike, count })
  } catch (error) {
    console.error('POST /api/project/[id]/like error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
