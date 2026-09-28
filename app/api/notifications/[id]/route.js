import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// DELETE /api/notifications/[id] - remove a handled notification
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await prisma.notification.deleteMany({
      where: { id: params.id, userId: session.user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
