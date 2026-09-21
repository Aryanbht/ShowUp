import './globals.css'
import { Providers } from './providers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata = {
  title: 'ShowUp — Build. Share. Connect.',
  description:
    'The social platform for Indian college students to share projects, find hackathon teammates, and get discovered.',
  keywords: ['hackathon', 'college students', 'projects', 'teammates', 'India', 'tech'],
  openGraph: {
    title: 'ShowUp — Build. Share. Connect.',
    description: 'Where Indian college students share projects, find hackathon teammates, and get discovered.',
    type: 'website',
  },
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-inter bg-canvas min-h-screen">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}
