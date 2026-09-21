# ShowUp 🚀

> Build. Share. Connect. — The social platform for Indian college students.

A full-stack Next.js 14 platform where students share projects, explore a feed, find hackathon teammates, and connect with each other.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide Icons
- **Auth:** NextAuth.js (Google OAuth only), Prisma Adapter
- **Database:** PostgreSQL + Prisma ORM
- **Storage:** Cloudinary (images)
- **Deployment:** Vercel

---

## Local Setup

### 1. Clone & Install

```bash
cd showup
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

You need:
- **DATABASE_URL** — PostgreSQL connection string (Neon, Supabase, or local)
- **NEXTAUTH_SECRET** — run `openssl rand -base64 32`
- **NEXTAUTH_URL** — `http://localhost:3000` for dev
- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET** — from Google Cloud Console (see below)
- **CLOUDINARY_*** — from your Cloudinary dashboard

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** → Web Application
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. For production add: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID & Secret to `.env.local`

---

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** → copy Cloud Name, API Key, API Secret
3. Add to `.env.local`

---

## Deploy to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add all environment variables
4. Add production `NEXTAUTH_URL` and update Google OAuth redirect URIs
5. Run `npx prisma db push` against production DB

---

## Project Structure

```
showup/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth
│   │   ├── project/       # Feed, create, like, comment
│   │   ├── user/          # Profile, me
│   │   ├── connection/    # Connect, accept, decline, status
│   │   ├── teammates/     # Filtered list
│   │   ├── notifications/ # Get + mark read
│   │   └── upload/        # Cloudinary upload
│   ├── feed/              # Main feed
│   ├── onboarding/        # 3-step setup
│   ├── profile/[username] # Public profile
│   ├── teammates/         # Find hackathon partners
│   └── notifications/     # Notification center
├── components/
│   ├── feed/              # ProjectCard, ProjectModal, PostModal, FeedClient
│   ├── landing/           # LandingClient
│   ├── layout/            # Header, MobileNav
│   ├── onboarding/        # ProgressBar, StepOne, StepTwo, StepThree
│   ├── profile/           # ConnectionButton, ProfileProjectGrid
│   ├── teammates/         # TeammateCard, FilterBar
│   └── ui/                # Avatar, SkillPill, TagInput, LoadingSpinner, EmptyState
├── lib/
│   ├── auth.js            # NextAuth config
│   ├── prisma.js          # Prisma singleton
│   └── cloudinary.js      # Cloudinary config
├── prisma/
│   └── schema.prisma      # Full DB schema
└── middleware.js          # Route protection + onboarding redirect
```

---

## Design System

Based on **neobrutalist** principles from DESIGN.md:
- Electric yellow `#FFC629` primary
- Zero radius on all structural elements
- Hard `4px 4px 0px #1A1A1A` box shadows
- `3px solid #1A1A1A` borders
- Space Grotesk (headings) + Inter (body)
