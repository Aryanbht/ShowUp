import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const preferredRegion = 'bom1'
export const dynamic = 'force-dynamic'

// GET /api/teammates/suggested?limit=2
// Lightweight endpoint for feed sidebar - returns small batch with connection status already included
export async function GET(req) {
  const handlerStart = performance.now()
  let queryCount = 0

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const currentUserId = session.user.id

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '2', 10), 5)

    const dbStart = performance.now()

    // 1. Fetch only the requested number of candidates
    const candidates = await prisma.user.findMany({
      where: {
        lookingForTeam: true,
        id: { not: currentUserId },
        onboarded: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        college: true,
        skills: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    queryCount++

    const candidateIds = candidates.map((u) => u.id)

    // 2. Query connections ONLY for the candidates
    let myConnections = []
    if (candidateIds.length > 0) {
      myConnections = await prisma.connection.findMany({
        where: {
          OR: [
            { fromUserId: currentUserId, toUserId: { in: candidateIds } },
            { toUserId: currentUserId, fromUserId: { in: candidateIds } },
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

    // Map connection status by other user ID
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

    const result = candidates.map((u) => {
      const conn = connectionMap.get(u.id)
      return {
        ...u,
        connectionStatus: conn?.status || 'NONE',
        connectionId: conn?.connectionId || null,
      }
    })

    const totalTime = performance.now() - handlerStart
    if (process.env.DEBUG_TIMING === 'true' || process.env.NODE_ENV === 'development') {
      console.log(
        `[DEBUG_TIMING][/api/teammates/suggested] total=${totalTime.toFixed(1)}ms | queryCount=${queryCount} | db=${dbTime.toFixed(1)}ms | returned=${result.length}`
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/teammates/suggested error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
