import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const artists = await prisma.artist.findMany({
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      nationality: true,
      featured: true,
    },
    orderBy: { lastName: 'asc' },
  });
  return NextResponse.json(artists);
}
