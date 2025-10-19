# DRAPE - Virtual Try-On SaaS

AI-powered virtual try-on platform. Upload your photo and clothing items to see how they look on you instantly.

## Features

- Virtual try-on using AI (Replicate IDM-VTON)
- Free plan: 2 try-ons
- Premium plan: Unlimited try-ons at $9.99/month
- High-resolution results (up to 1024x1024)
- Admin panel for managing users and analytics

## Tech Stack

- Next.js 15
- Prisma + Supabase (PostgreSQL)
- Stripe for payments
- Replicate AI for virtual try-on
- Tailwind CSS + shadcn/ui

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables (see `.env.local`)

3. Run Prisma migrations:
```bash
npx prisma db push
```

4. Start the dev server:
```bash
npm run dev
```

## Deployment

Deploy to Vercel with one click.

## License

MIT
