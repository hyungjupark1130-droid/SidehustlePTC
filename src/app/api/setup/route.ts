import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: 'admin@sidehustle.art' },
  });

  if (existing) {
    return NextResponse.json({ message: 'Admin user already exists' });
  }

  const passwordHash = await bcrypt.hash('changeme123!', 12);
  await prisma.user.create({
    data: {
      email: 'admin@sidehustle.art',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  return NextResponse.json({ message: 'Admin user created. Email: admin@sidehustle.art / Password: changeme123!' });
}
