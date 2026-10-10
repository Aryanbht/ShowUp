import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// DELETE /api/block/[userId] — unblock a user (idempotent)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const myId = session.user.id
    const blockedId = params.userId

    await prisma.block.deleteMany({
      where: { blockerId: myId, blockedId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/block/[userId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
