import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const preferredRegion = 'bom1'
export const dynamic = 'force-dynamic'

// GET /api/teammates?branch=&year=&skills=&interests=&cursor=&limit=20
export async function GET(req) {
  const handlerStart = performance.now()
  let queryCount = 0

  try {
    const authStart = performance.now()
    const session = await getServerSession(authOptions)
    const authTime = performance.now() - authStart
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const currentUserId = session.user.id

    const { searchParams } = new URL(req.url)
    const branch = searchParams.get('branch')
    const year = searchParams.get('year')
    const search = searchParams.get('search')?.trim()
    const skills = searchParams.get('skills')
    const interests = searchParams.get('interests')
    const cursor = searchParams.get('cursor')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)
    const paginate = searchParams.get('paginate') === 'true' || Boolean(cursor)

    const where = {
      lookingForTeam: true,
      id: { not: currentUserId },
      onboarded: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: [search] } },
      ]
    }

    if (branch) where.branch = branch
    if (year) where.year = year
    if (skills) {
      const skillList = skills.split(',').filter(Boolean)
      if (skillList.length > 0) {
        where.skills = { hasSome: skillList }
      }
    }
    if (interests) {
      const interestList = interests.split(',').filter(Boolean)
      if (interestList.length > 0) {
        where.hackathonInterests = { hasSome: interestList }
      }
    }

    const dbStart = performance.now()

    // 1. Fetch paginated teammates with cursor
    const teammates = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        college: true,
        branch: true,
        year: true,
        bio: true,
        skills: true,
        hackathonInterests: true,
        lookingForTeam: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    })
    queryCount++

    let nextCursor = null
    if (teammates.length > limit) {
      const nextItem = teammates.pop()
      nextCursor = nextItem.id
    }

    const teammateIds = teammates.map((t) => t.id)

    // 2. Fetch connections for ONLY the returned page of users
    let myConnections = []
    if (teammateIds.length > 0) {
      myConnections = await prisma.connection.findMany({
        where: {
          OR: [
            { fromUserId: currentUserId, toUserId: { in: teammateIds } },
            { toUserId: currentUserId, fromUserId: { in: teammateIds } },
          ],
        },
        select: {
          id: true,
          fromUserId: true,
          toUserId: true,
          status: true,
        },
      })
      queryCount++
    }

    const dbTime = performance.now() - dbStart

    // Build connection map by other user ID
    const connectionMap = new Map()
    for (const c of myConnections) {
      const otherId = c.fromUserId === currentUserId ? c.toUserId : c.fromUserId
      const isAccepted = c.status === 'ACCEPTED' || c.status === 'accepted'
      let status = 'NONE'
      if (isAccepted) {
        status = 'ACCEPTED'
      } else if (c.fromUserId === currentUserId) {
        status = 'PENDING_SENT'
      } else {
        status = 'PENDING_RECEIVED'
      }
      connectionMap.set(otherId, { status, connectionId: c.id })
    }

    const result = teammates.map((t) => {
      const conn = connectionMap.get(t.id)
      return {
        ...t,
        connectionStatus: conn?.status || 'NONE',
        connectionId: conn?.connectionId || null,
      }
    })

    const totalTime = performance.now() - handlerStart
    if (process.env.DEBUG_TIMING === 'true' || process.env.NODE_ENV === 'development') {
      console.log(
        `[DEBUG_TIMING][/api/teammates] total=${totalTime.toFixed(1)}ms | queryCount=${queryCount} | auth=${authTime.toFixed(1)}ms | db=${dbTime.toFixed(1)}ms | items=${result.length}`
      )
    }

    // Keep response backward-compatible: return object if paginate requested, array otherwise
    if (paginate) {
      return NextResponse.json({ teammates: result, nextCursor })
    }

    const response = NextResponse.json(result)
    if (nextCursor) {
      response.headers.set('X-Next-Cursor', nextCursor)
    }
    return response
  } catch (error) {
    console.error('GET /api/teammates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
