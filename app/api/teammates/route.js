import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/teammates?branch=&year=&skills=&interests=
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const branch = searchParams.get('branch')
    const year = searchParams.get('year')
    const skills = searchParams.get('skills') // comma-separated
    const interests = searchParams.get('interests') // comma-separated

    const where = {
      lookingForTeam: true,
      id: { not: session.user.id },
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
        skills: true,
        hackathonInterests: true,
        lookingForTeam: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(teammates)
  } catch (error) {
    console.error('GET /api/teammates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
