# DS Flow Dashboard

This is the central dashboard for the DS Flow WordPress Plugin system.

## Environment Variables

For Vercel deployment, you must set the following environment variables. See `.env.example` for details.
- `DATABASE_URL`: Connection string for PostgreSQL (e.g., Supabase transaction pooler).
- `DIRECT_URL`: Direct connection string for PostgreSQL (used for Prisma migrations).
- `NEXTAUTH_URL`: The production URL of this dashboard (e.g., `https://ds-flow-dashboard.vercel.app`).
- `NEXTAUTH_SECRET`: A secure random string for signing NextAuth sessions.

## Deployment to Vercel

1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Add the environment variables in the Vercel project settings.
4. Set the Build Command to `npm run build` (default).
5. Deploy!

## Prisma Database Migrations

Whenever you update `prisma/schema.prisma` or deploy to a new environment, run the following commands:

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema changes to the database
npx prisma db push
```

For production environments, it is recommended to use migrations:
```bash
npx prisma migrate deploy
```
