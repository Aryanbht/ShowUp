import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/notifications
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // For CONNECTION_REQUEST, find the connection id
    const enriched = await Promise.all(
      notifications.map(async (n) => {
        if (n.type === 'CONNECTION_REQUEST') {
          // Parse sender name from message
          const connection = await prisma.connection.findFirst({
            where: { toUserId: session.user.id, status: 'PENDING' },
            include: {
              from: { select: { id: true, name: true, username: true, avatar: true } },
            },
          })
          return { ...n, connectionData: connection || null }
        }
        return n
      })
    )

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
