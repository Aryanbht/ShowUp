'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#FFC629',
            border: '3px solid #1A1A1A',
            borderRadius: '0px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: '700',
            fontSize: '13px',
            padding: '12px 16px',
            boxShadow: '4px 4px 0px #FFC629',
          },
          success: {
            iconTheme: { primary: '#FFC629', secondary: '#1A1A1A' },
          },
          error: {
            style: {
              background: '#FF4D4D',
              color: '#FFFFFF',
              boxShadow: '4px 4px 0px #1A1A1A',
            },
          },
        }}
      />
    </SessionProvider>
  )
}
