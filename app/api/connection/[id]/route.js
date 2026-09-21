import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/connection/[id] - accept or decline
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const { action } = await req.json() // 'accept' or 'decline'

    const connection = await prisma.connection.findUnique({ where: { id } })
    if (!connection) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only the recipient can accept/decline
    if (connection.toUserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (action === 'decline') {
      await prisma.connection.delete({ where: { id } })
      return NextResponse.json({ message: 'Connection declined' })
    }

    if (action === 'accept') {
      const updated = await prisma.connection.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      })

      // Notify sender
      const acceptor = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      })
      await prisma.notification.create({
        data: {
          userId: connection.fromUserId,
          type: 'CONNECTION_ACCEPTED',
          message: `${acceptor.name} accepted your connection request`,
          link: `/profile/${(await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } })).username}`,
        },
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('PATCH /api/connection/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
