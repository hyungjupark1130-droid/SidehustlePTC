import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      bio: true,
      nationality: true,
      createdAt: true,
      images: {
        take: 1,
        orderBy: { order: 'asc' },
        select: { url: true, alt: true },
      },
      publications: {
        select: { title: true, slug: true, publishedAt: true },
        orderBy: { publishedAt: 'asc' },
      },
    },
  });

  if (!artist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(artist);
}
