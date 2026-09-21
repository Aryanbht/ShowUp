import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingClient from '@/components/landing/LandingClient'

export const metadata = {
  title: 'ShowUp — Build. Share. Connect.',
  description: 'The social platform for Indian college students to share projects, find hackathon teammates, and get discovered.',
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.onboarded) redirect('/feed')
  if (session && !session.user.onboarded) redirect('/onboarding')

  return <LandingClient />
}
