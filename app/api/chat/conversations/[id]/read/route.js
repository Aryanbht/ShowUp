import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const myId = session.user.id
    const conversationId = params.id

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.userAId !== myId && conversation.userBId !== myId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: myId },
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    })

    return NextResponse.json({ updatedCount: updated.count })
  } catch (error) {
    console.error('PATCH /api/chat/conversations/[id]/read error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
