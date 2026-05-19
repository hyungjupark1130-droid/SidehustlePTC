import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  externalUrl: z.string().optional(),
  inStock: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('merchandise', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const item = await prisma.merchandiseItem.update({
    where: { id: params.id },
    data: parsed.data,
  });

  await writeAudit({ userId, action: 'update', entity: 'merchandise', entityId: params.id });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('merchandise', 'delete');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.merchandiseItem.delete({ where: { id: params.id } });
  await writeAudit({ userId, action: 'delete', entity: 'merchandise', entityId: params.id });
  return NextResponse.json({ success: true });
}
