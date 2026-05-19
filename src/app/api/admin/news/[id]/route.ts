import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  publishedAt: z.string().optional(),
  image: z.string().nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('news', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const item = await prisma.newsItem.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : undefined,
    },
  });

  await writeAudit({ userId, action: 'update', entity: 'news', entityId: params.id });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('news', 'delete');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.newsItem.delete({ where: { id: params.id } });
  await writeAudit({ userId, action: 'delete', entity: 'news', entityId: params.id });
  return NextResponse.json({ success: true });
}
