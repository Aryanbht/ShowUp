import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const myId = session.user.id
    const conversationId = params.id

    const url = new URL(req.url)
    const after = url.searchParams.get('after')

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.userAId !== myId && conversation.userBId !== myId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const whereClause = { conversationId }
    if (after) {
      whereClause.createdAt = { gt: new Date(after) }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      take: after ? undefined : 100
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('GET /api/chat/conversations/[id]/messages error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const myId = session.user.id
    const conversationId = params.id

    const body = await req.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }

    const trimmedContent = content.trim()
    if (trimmedContent.length === 0 || trimmedContent.length > 2000) {
      return NextResponse.json({ error: 'Message must be between 1 and 2000 characters' }, { status: 400 })
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (conversation.userAId !== myId && conversation.userBId !== myId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const otherUserId = conversation.userAId === myId ? conversation.userBId : conversation.userAId

    // Verify still connected
    const connection = await prisma.connection.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { fromUserId: myId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: myId }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Not connected' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: myId,
        content: trimmedContent
      }
    })

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'NEW_MESSAGE',
        message: `${session.user.name} sent you a message`,
        link: `/messages?user=${myId}`
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('POST /api/chat/conversations/[id]/messages error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
