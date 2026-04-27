import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.error('Error: DATABASE_URL or DIRECT_URL not found in .env')
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('Usage: npx tsx scripts/reset-admin.ts <email> <new_password>')
    process.exit(1)
  }

  const email = args[0]
  const password = args[1]

  console.log(`Attempting to reset password for: ${email}...`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error(`Error: User with email "${email}" not found.`)
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { email },
    data: { 
      password: hashedPassword,
      isActive: true,
      role: 'ADMIN' // Ensure they have admin access
    }
  })

  console.log(`Successfully updated password for ${email}.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
