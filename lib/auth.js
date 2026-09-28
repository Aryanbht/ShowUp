import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import prisma from './prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On first sign-in, user object is populated
      if (user) {
        token.id = user.id
        token.username = user.username
        token.onboarded = user.onboarded
        token.avatar = user.avatar
        token.college = user.college
      }
      // Always re-fetch onboarded status from DB so returning users
      // who have completed onboarding are recognized correctly
      if (!token.onboarded && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { onboarded: true, username: true, avatar: true, college: true },
        })
        if (dbUser) {
          token.onboarded = dbUser.onboarded
          if (!token.username) token.username = dbUser.username
          if (!token.avatar) token.avatar = dbUser.avatar
          if (!token.college) token.college = dbUser.college
        }
      }
      // If user updates profile in onboarding, update token
      if (trigger === 'update' && session) {
        if (session.onboarded !== undefined) token.onboarded = session.onboarded
        if (session.username) token.username = session.username
        if (session.avatar) token.avatar = session.avatar
        if (session.college) token.college = session.college
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.onboarded = token.onboarded
        session.user.avatar = token.avatar
        session.user.college = token.college
      }
      return session
    },
    async signIn({ user }) {
      // Auto-generate a username from email if new user
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })
      if (!existingUser) {
        const baseUsername = user.email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase()
        let username = baseUsername
        let counter = 1
        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`
          counter++
        }
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name || '',
            username,
          },
        })
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // After sign-in, check the actual DB record to route correctly
      if (url.startsWith(baseUrl) || url.startsWith('/')) {
        return url
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
