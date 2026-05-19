import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  body: z.string().min(1),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId } = await checkPermission('pages', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const page = await prisma.page.update({
    where: { id: params.id },
    data: { body: parsed.data.body },
  });

  await writeAudit({ userId, action: 'update', entity: 'page', entityId: params.id });
  return NextResponse.json(page);
}
