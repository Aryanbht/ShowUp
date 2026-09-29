import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const myId = session.user.id

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { userAId: myId },
            { userBId: myId }
          ]
        },
        senderId: { not: myId },
        readAt: null
      }
    })

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('GET /api/chat/unread-count error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
