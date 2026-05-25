import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().default(''),
  order: z.number().int().default(0),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('artists', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = imageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const image = await prisma.artistImage.create({
    data: {
      artistId: params.id,
      url: parsed.data.url,
      alt: parsed.data.alt,
      order: parsed.data.order,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
