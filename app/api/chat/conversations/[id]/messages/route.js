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
    const resolvedParams = await Promise.resolve(params)
    const conversationId = resolvedParams?.id

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

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

    let messages
    if (after) {
      messages = await prisma.message.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
      })
    } else {
      const recent = await prisma.message.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      messages = recent.reverse()
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('GET /api/chat/conversations/[id]/messages error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const myId = session.user.id
    const resolvedParams = await Promise.resolve(params)
    const conversationId = resolvedParams?.id

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

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

    // Verify still connected (case-insensitive)
    const connection = await prisma.connection.findFirst({
      where: {
        status: { in: ['ACCEPTED', 'accepted'] },
        OR: [
          { fromUserId: myId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: myId }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'You can only message accepted connections.' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: myId,
        content: trimmedContent
      }
    })

    // Update conversation updatedAt (non-blocking failure)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    }).catch(err => {
      console.warn('Failed to update conversation updatedAt:', err)
    })

    // Create Notification non-blocking so it never breaks message sending
    const senderName = session.user?.name || session.user?.username || 'A teammate'
    prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'NEW_MESSAGE',
        message: `${senderName} sent you a message`,
        link: `/messages?user=${myId}`
      }
    }).catch(notifErr => {
      console.warn('Failed to create new message notification:', notifErr)
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('POST /api/chat/conversations/[id]/messages error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
