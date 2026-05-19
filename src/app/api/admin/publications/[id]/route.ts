import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  title: z.string().min(1).optional(),
  authors: z.array(z.string()).optional(),
  publishedAt: z.string().optional(),
  description: z.string().optional(),
  externalUrl: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('publications', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const publication = await prisma.publication.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : undefined,
      externalUrl: parsed.data.externalUrl !== undefined ? (parsed.data.externalUrl || null) : undefined,
    },
  });

  await writeAudit({ userId, action: 'update', entity: 'publication', entityId: params.id });
  return NextResponse.json(publication);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('publications', 'delete');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.publication.delete({ where: { id: params.id } });
  await writeAudit({ userId, action: 'delete', entity: 'publication', entityId: params.id });
  return NextResponse.json({ success: true });
}
