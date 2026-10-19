import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const preferredRegion = 'bom1'
export const dynamic = 'force-dynamic'

// GET /api/project/feed?cursor=xxx&limit=10
export async function GET(req) {
  const handlerStart = performance.now()
  let queryCount = 0

  try {
    const authStart = performance.now()
    const session = await getServerSession(authOptions)
    const authTime = performance.now() - authStart
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const dbStart = performance.now()

    // 1. Fetch only card fields with lean select and aggregated counts
    const projects = await prisma.project.findMany({
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        techStack: true,
        projectUrl: true,
        githubUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            college: true,
            year: true,
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    })
    queryCount++

    let nextCursor = null
    if (projects.length > limit) {
      const nextItem = projects.pop()
      nextCursor = nextItem.id
    }

    const projectIds = projects.map((p) => p.id)

    // 2. Fetch 'liked by me' for ONLY the returned project IDs in one fast query
    let likedSet = new Set()
    if (projectIds.length > 0) {
      const myLikes = await prisma.like.findMany({
        where: {
          projectId: { in: projectIds },
          userId: session.user.id,
        },
        select: { projectId: true },
      })
      queryCount++
      likedSet = new Set(myLikes.map((l) => l.projectId))
    }

    const dbTime = performance.now() - dbStart

    const formatted = projects.map((p) => ({
      ...p,
      liked: likedSet.has(p.id),
    }))

    const totalTime = performance.now() - handlerStart
    if (process.env.DEBUG_TIMING === 'true' || process.env.NODE_ENV === 'development') {
      console.log(
        `[DEBUG_TIMING][/api/project/feed] total=${totalTime.toFixed(1)}ms | queryCount=${queryCount} | auth=${authTime.toFixed(1)}ms | db=${dbTime.toFixed(1)}ms | items=${formatted.length}`
      )
    }

    return NextResponse.json({ projects: formatted, nextCursor })
  } catch (error) {
    console.error('GET /api/project/feed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
