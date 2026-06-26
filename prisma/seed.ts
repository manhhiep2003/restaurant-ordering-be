import 'dotenv/config';

import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding...');

  // clear
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();

  const seedPassword = process.env.SEED_PASSWORD;

  if (!seedPassword) {
    throw new Error('SEED_PASSWORD is not set');
  }

  const password = await bcrypt.hash(seedPassword, 10);

  // Users
  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        fullName: 'Administrator',
        passwordHash: password,
        role: 'ADMIN',
      },
      {
        username: 'staff1',
        fullName: 'Nguyễn Văn A',
        passwordHash: password,
        role: 'STAFF',
      },
      {
        username: 'staff2',
        fullName: 'Trần Văn B',
        passwordHash: password,
        role: 'STAFF',
      },
      {
        username: 'kitchen1',
        fullName: 'Bếp 1',
        passwordHash: password,
        role: 'KITCHEN',
      },
    ],
  });

  // Tables
  await prisma.table.createMany({
    data: Array.from({ length: 20 }).map((_, i) => ({
      name: `Bàn ${i + 1}`,
    })),
  });

  // Categories
  const food = await prisma.category.create({
    data: { name: 'Món chính' },
  });

  const drink = await prisma.category.create({
    data: { name: 'Đồ uống' },
  });

  const dessert = await prisma.category.create({
    data: { name: 'Tráng miệng' },
  });

  // Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Ba chỉ bò Mỹ',
        categoryId: food.id,
        price: 249000,
      },
      {
        name: 'Sườn non bò Mỹ',
        categoryId: food.id,
        price: 279000,
      },
      {
        name: 'Kimchi',
        categoryId: food.id,
        price: 39000,
      },
      {
        name: 'Cơm trắng',
        categoryId: food.id,
        price: 15000,
      },
      {
        name: 'Coca Cola',
        categoryId: drink.id,
        price: 20000,
      },
      {
        name: 'Sprite',
        categoryId: drink.id,
        price: 20000,
      },
      {
        name: 'Trà đào',
        categoryId: drink.id,
        price: 35000,
      },
      {
        name: 'Kem Vanilla',
        categoryId: dessert.id,
        price: 45000,
      },
    ],
  });

  console.log('✅ Seed completed.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
