import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/user/me - update own profile / complete onboarding
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      name,
      username,
      college,
      branch,
      year,
      bio,
      skills,
      githubUrl,
      linkedinUrl,
      avatar,
      lookingForTeam,
      hackathonInterests,
      onboarded,
    } = body

    // Username uniqueness check (exclude self)
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(college !== undefined && { college }),
        ...(branch !== undefined && { branch }),
        ...(year !== undefined && { year }),
        ...(bio !== undefined && { bio }),
        ...(skills !== undefined && { skills }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(avatar !== undefined && { avatar }),
        ...(lookingForTeam !== undefined && { lookingForTeam }),
        ...(hackathonInterests !== undefined && { hackathonInterests }),
        ...(onboarded !== undefined && { onboarded }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/user/me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/user/me - get own profile
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            connectionsFrom: { where: { status: 'ACCEPTED' } },
            connectionsTo: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
