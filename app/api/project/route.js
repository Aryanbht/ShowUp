import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/project - create project
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, description, coverImage, techStack, projectUrl, githubUrl } = body

    if (!title || !description || !coverImage) {
      return NextResponse.json(
        { error: 'Title, description, and cover image are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        title,
        description,
        coverImage,
        techStack: techStack || [],
        projectUrl: projectUrl || null,
        githubUrl: githubUrl || null,
      },
      include: {
        user: {
          select: {
            id: true, name: true, username: true, avatar: true, college: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST /api/project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
