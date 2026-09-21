import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/connection/status?userId=xxx
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const meId = session.user.id

    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromUserId: meId, toUserId: targetUserId },
          { fromUserId: targetUserId, toUserId: meId },
        ],
      },
    })

    if (!connection) {
      return NextResponse.json({ status: 'NONE', connection: null })
    }

    // Determine perspective
    let perspective = connection.status
    if (connection.status === 'PENDING') {
      if (connection.fromUserId === meId) {
        perspective = 'PENDING_SENT'
      } else {
        perspective = 'PENDING_RECEIVED'
      }
    }

    return NextResponse.json({ status: perspective, connection })
  } catch (error) {
    console.error('GET /api/connection/status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
