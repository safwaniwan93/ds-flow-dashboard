import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = "postgresql://postgres.ccvdjulwhycuqiqnocpm:cLXtWZY8E9dWywWy@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  
  console.log('Seed successful:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
