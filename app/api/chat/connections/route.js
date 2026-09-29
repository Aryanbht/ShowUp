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
    const userId = session.user.id

    // Find all accepted connections where user is either from or to
    const connections = await prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
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

    // Extract the other user details
    let chatUsers = connections.map(c => {
      const otherUser = c.fromUserId === userId ? c.to : c.from
      return otherUser
    })

    // Fetch conversation data for each connection
    const conversations = await Promise.all(
      chatUsers.map(async (user) => {
        const userAId = userId < user.id ? userId : user.id
        const userBId = userId < user.id ? user.id : userId

        const conversation = await prisma.conversation.findUnique({
          where: {
            userAId_userBId: { userAId, userBId }
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
                    senderId: user.id,
                    readAt: null
                  }
                }
              }
            }
          }
        })

        const lastMessage = conversation?.messages[0] || null
        const unreadCount = conversation?._count?.messages || 0

        return {
          ...user,
          lastMessage,
          unreadCount,
          updatedAt: conversation?.updatedAt || null
        }
      })
    )

    // Sort by most recent message (or updatedAt), then by name
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt
      const bTime = b.lastMessage?.createdAt || b.updatedAt

      if (aTime && bTime) {
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      }
      if (aTime) return -1
      if (bTime) return 1
      
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('GET /api/chat/connections error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
