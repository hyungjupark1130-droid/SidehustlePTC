import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';

const schema = z.object({ publicationId: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('artists', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  await prisma.artist.update({
    where: { id: params.id },
    data: { publications: { connect: { id: parsed.data.publicationId } } },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('artists', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const publicationId = searchParams.get('publicationId');
  if (!publicationId) return NextResponse.json({ error: 'publicationId required' }, { status: 400 });

  await prisma.artist.update({
    where: { id: params.id },
    data: { publications: { disconnect: { id: publicationId } } },
  });

  return NextResponse.json({ success: true });
}
