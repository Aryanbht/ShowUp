import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChatClient from '@/components/chat/ChatClient'

export const metadata = {
  title: 'Messages | ShowUp',
  description: 'Chat with your connections on ShowUp.',
}

export default async function MessagesPage({ searchParams }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  if (session.user && !session.user.onboarded) {
    redirect('/onboarding')
  }

  const initialUser = searchParams.user || null

  return <ChatClient initialUser={initialUser} currentUserId={session.user.id} />
}
