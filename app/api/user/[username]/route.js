import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/user/[username] - public profile
export async function GET(req, { params }) {
  try {
    const { username } = params

    const user = await prisma.user.findUnique({
      where: { username },
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
        githubUrl: true,
        linkedinUrl: true,
        lookingForTeam: true,
        hackathonInterests: true,
        createdAt: true,
        projects: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { likes: true, comments: true } },
          },
        },
        _count: {
          select: {
            connectionsFrom: { where: { status: 'ACCEPTED' } },
            connectionsTo: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const connectionCount =
      (user._count?.connectionsFrom || 0) + (user._count?.connectionsTo || 0)

    return NextResponse.json({ ...user, connectionCount })
  } catch (error) {
    console.error('GET /api/user/[username] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/user/[username] - check username availability
export async function POST(req, { params }) {
  try {
    const { username } = params
    const session = await getServerSession(authOptions)

    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    const isAvailable = !existing || (session && existing.id === session.user.id)
    return NextResponse.json({ available: isAvailable })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
