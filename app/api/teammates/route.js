import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/teammates?branch=&year=&skills=&interests=
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const currentUserId = session.user.id

    const { searchParams } = new URL(req.url)
    const branch = searchParams.get('branch')
    const year = searchParams.get('year')
    const skills = searchParams.get('skills')
    const interests = searchParams.get('interests')

    const where = {
      lookingForTeam: true,
      id: { not: currentUserId },
      onboarded: true,
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

    // Run teammates query and current user's connections in parallel (2 fast queries instead of N)
    const [teammates, myConnections] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          college: true,
          branch: true,
          year: true,
          skills: true,
          hackathonInterests: true,
          lookingForTeam: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.connection.findMany({
        where: {
          OR: [
            { fromUserId: currentUserId },
            { toUserId: currentUserId }
          ]
        }
      })
    ])

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

    const result = teammates.map(t => {
      const conn = connectionMap.get(t.id)
      return {
        ...t,
        connectionStatus: conn?.status || 'NONE',
        connectionId: conn?.connectionId || null,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/teammates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
