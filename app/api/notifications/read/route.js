import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/notifications/read - mark one or all notifications as read
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const where = {
      userId: session.user.id,
      read: false,
      ...(body.id ? { id: body.id } : {}),
    }

    await prisma.notification.updateMany({
      where,
      data: { read: true },
    })

    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
