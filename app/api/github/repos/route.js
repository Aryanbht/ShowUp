import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find the GitHub account linked to this user
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github'
      }
    })

    if (!account || !account.access_token) {
      return NextResponse.json({ repos: [] })
    }

    // Fetch user's repos from GitHub API
    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })

    if (!res.ok) {
      if (res.status === 401) {
        // Token might be expired or revoked
        return NextResponse.json({ repos: [] })
      }
      throw new Error('Failed to fetch from GitHub API')
    }

    const data = await res.json()
    
    // Map to just the fields we need
    const repos = data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      topics: repo.topics || []
    }))

    return NextResponse.json({ repos })
  } catch (error) {
    console.error('GitHub repos fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
