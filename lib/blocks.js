import prisma from '@/lib/prisma'

// Returns array of user IDs in any block relationship with userId (either direction)
export async function getBlockedIds(userId) {
  if (!userId) return []
  const blocks = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: { blockerId: true, blockedId: true },
  })
  const ids = new Set()
  for (const b of blocks) {
    if (b.blockerId === userId) ids.add(b.blockedId)
    else ids.add(b.blockerId)
  }
  return [...ids]
}

// Returns true if a and b have a block in either direction
export async function isBlockedBetween(a, b) {
  if (!a || !b || a === b) return false
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
    select: { id: true },
  })
  return !!block
}

// TODO: Chat filtering - if chat routes exist, use getBlockedIds() to:
// - Exclude blocked users from /api/chat/connections results
// - Return 403 on POST /api/chat/conversations when blocked
// - Return 403 on GET/POST /api/chat/conversations/[id]/messages when blocked
// - Exclude blocked users' messages from /api/chat/unread-count
