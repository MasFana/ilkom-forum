# Ilkom Forum (Next.js + PocketBase)

This app implements a minimal forum using Next.js App Router, PocketBase auth (Google OAuth), React Query, and Tailwind.

## Prerequisites

- PocketBase running locally at http://127.0.0.1:8090 (or set NEXT_PUBLIC_PB_URL)
- In PocketBase Settings → Auth providers, enable Google OAuth and set allowed redirect to http://localhost:3000/login
- Collections as in `pb_schema.json`

## Configure

Create `.env.local` in the project root:

```
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090
```

## Run

- Install deps: `pnpm install`
- Dev server: `pnpm dev`

Routes:

- `/login` – Google sign-in and callback
- `/forum` – posts list with Latest/Popular filters
- `/forum/[id]` – post details and comments
- `/new-post` – create a post
- `/profile` – set username and upload avatar

All routes are protected by middleware except `/login`.

## Notes

- Session is stored in a cookie `pb_auth` and refreshed in middleware.
- Popular filter counts comments inside a selected window and sorts posts by that count.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
