# Security deployment checklist

## Supabase

1. Open the Supabase SQL Editor.
2. Run `prisma/supabase-hardening.sql` once.
3. Re-run the Supabase Security Advisor and confirm the seven DS Flow tables are no longer unrestricted.
4. Rotate the database password because a production-looking credential has existed in the local `.env` file.
5. Update `DATABASE_URL` in Vercel with the rotated password.

The SQL intentionally creates no `anon` or `authenticated` policies. DS Flow accesses PostgreSQL only from its trusted Next.js server using `DATABASE_URL`; browsers must not query these tables through the Supabase Data API.

## Vercel

1. Rotate `NEXTAUTH_SECRET` and update it in the Vercel production environment.
2. Redeploy the production deployment.
3. Sign in again. Rotating the secret invalidates all existing dashboard sessions.

## Verification

1. Confirm an admin can list all sites.
2. Confirm staff can only list and modify their own sites.
3. Confirm a disabled user can no longer load dashboard data.
4. Connect a test WordPress site and sync fewer than 500 products per request.
