import FeedClient from '@/components/feed/FeedClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Feed — ShowUp',
  description: 'Discover the latest projects from Indian college students',
}

export default async function FeedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')
  if (!session.user.onboarded) redirect('/onboarding')

  return <FeedClient />
}
