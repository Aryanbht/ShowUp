import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/connection - send connection request
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { toUserId } = await req.json()
    const fromUserId = session.user.id

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: "Can't connect to yourself" }, { status: 400 })
    }

    // Check if already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'Connection already exists', connection: existing }, { status: 409 })
    }

    const connection = await prisma.connection.create({
      data: { fromUserId, toUserId, status: 'PENDING' },
    })

    // Notify target user
    const sender = await prisma.user.findUnique({
      where: { id: fromUserId },
      select: { name: true, username: true },
    })
    await prisma.notification.create({
      data: {
        userId: toUserId,
        type: 'CONNECTION_REQUEST',
        message: `${sender.name} wants to connect with you`,
        link: `/notifications`,
      },
    })

    return NextResponse.json(connection, { status: 201 })
  } catch (error) {
    console.error('POST /api/connection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
