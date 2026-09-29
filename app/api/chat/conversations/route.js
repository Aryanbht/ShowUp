import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const myId = session.user.id

    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    if (userId === myId) {
      return NextResponse.json({ error: 'Cannot start conversation with yourself' }, { status: 400 })
    }

    // Verify ACCEPTED connection
    const connection = await prisma.connection.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromUserId: myId, toUserId: userId },
          { fromUserId: userId, toUserId: myId }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Not connected' }, { status: 403 })
    }

    const userAId = myId < userId ? myId : userId
    const userBId = myId < userId ? userId : myId

    let conversation = await prisma.conversation.findUnique({
      where: {
        userAId_userBId: { userAId, userBId }
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userAId,
          userBId
        }
      })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('POST /api/chat/conversations error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
