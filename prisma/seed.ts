import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@easecity.com' },
    update: {},
    create: {
      email: 'admin@easecity.com',
      name: 'Admin',
      hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })

  const member = await prisma.user.upsert({
    where: { email: 'user@easecity.com' },
    update: {},
    create: {
      email: 'user@easecity.com',
      name: 'Demo User',
      hashedPassword: await bcrypt.hash('User1234!', 12),
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created users:')
  console.log(`   Admin: ${admin.email} (password: Admin123!)`)
  console.log(`   User:  ${member.email} (password: User1234!)`)

  console.log('🌱 Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
