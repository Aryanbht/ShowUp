import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/project/feed?cursor=xxx&limit=10
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10')

    const projects = await prisma.project.findMany({
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true, name: true, username: true, avatar: true, college: true,
          },
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    })

    let nextCursor = null
    if (projects.length > limit) {
      const nextItem = projects.pop()
      nextCursor = nextItem.id
    }

    const formatted = projects.map((p) => ({
      ...p,
      liked: p.likes.length > 0,
      likes: undefined,
    }))

    return NextResponse.json({ projects: formatted, nextCursor })
  } catch (error) {
    console.error('GET /api/project/feed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
