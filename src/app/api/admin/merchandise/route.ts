import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  externalUrl: z.string().optional(),
  inStock: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
});

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now()
  );
}

export async function POST(req: NextRequest) {
  const { allowed, userId } = await checkPermission('merchandise', 'create');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const item = await prisma.merchandiseItem.create({
    data: {
      slug: slugify(parsed.data.title),
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      externalUrl: parsed.data.externalUrl ?? null,
      inStock: parsed.data.inStock ?? true,
      imageUrl: parsed.data.imageUrl ?? null,
    },
  });

  await writeAudit({ userId, action: 'create', entity: 'merchandise', entityId: item.id });
  return NextResponse.json(item, { status: 201 });
}
