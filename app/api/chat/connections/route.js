import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // 1. Single query for all accepted connections
    const connections = await prisma.connection.findMany({
      where: {
        status: { in: ['ACCEPTED', 'accepted'] },
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: {
        from: { select: { id: true, name: true, username: true, avatar: true, college: true } },
        to: { select: { id: true, name: true, username: true, avatar: true, college: true } }
      }
    })

    const chatUsers = connections.map(c => (c.fromUserId === userId ? c.to : c.from))

    if (chatUsers.length === 0) {
      return NextResponse.json([])
    }

    // 2. Single query for all conversations of this user (NOT N parallel queries)
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                readAt: null
              }
            }
          }
        }
      }
    })

    // Map conversation by other user ID
    const convMap = new Map()
    for (const conv of conversations) {
      const otherId = conv.userAId === userId ? conv.userBId : conv.userAId
      convMap.set(otherId, conv)
    }

    const result = chatUsers.map(user => {
      const conv = convMap.get(user.id)
      return {
        ...user,
        lastMessage: conv?.messages?.[0] || null,
        unreadCount: conv?._count?.messages || 0,
        updatedAt: conv?.updatedAt || null
      }
    })

    // Sort by most recent message (or updatedAt), then by name
    result.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt
      const bTime = b.lastMessage?.createdAt || b.updatedAt

      if (aTime && bTime) {
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      }
      if (aTime) return -1
      if (bTime) return 1

      return (a.name || '').localeCompare(b.name || '')
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/chat/connections error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
