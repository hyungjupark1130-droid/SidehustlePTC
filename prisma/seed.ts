import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@sidehustle.art';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123!';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // Seed static pages
  for (const slug of ['about', 'contact']) {
    await prisma.page.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        body: '',
      },
    });
  }

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
