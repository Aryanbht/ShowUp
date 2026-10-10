import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET linked accounts
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE a linked account by provider
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider')

    if (!provider) return NextResponse.json({ error: 'Provider required' }, { status: 400 })

    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: provider
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
