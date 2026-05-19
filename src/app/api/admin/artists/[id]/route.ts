import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().optional(),
  birthYear: z.number().nullable().optional(),
  deathYear: z.number().nullable().optional(),
  nationality: z.string().nullable().optional(),
  featured: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('artists', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const artist = await prisma.artist.update({
    where: { id: params.id },
    data: parsed.data,
  });

  await writeAudit({ userId, action: 'update', entity: 'artist', entityId: params.id });
  return NextResponse.json(artist);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('artists', 'delete');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.artist.delete({ where: { id: params.id } });
  await writeAudit({ userId, action: 'delete', entity: 'artist', entityId: params.id });
  return NextResponse.json({ success: true });
}
