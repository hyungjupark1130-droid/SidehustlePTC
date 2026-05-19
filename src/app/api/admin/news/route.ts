import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  publishedAt: z.string().optional(),
  image: z.string().nullable().optional(),
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
  const { allowed, userId } = await checkPermission('news', 'create');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const item = await prisma.newsItem.create({
    data: {
      slug: slugify(parsed.data.title),
      title: parsed.data.title,
      body: parsed.data.body,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
      image: parsed.data.image ?? null,
    },
  });

  await writeAudit({ userId, action: 'create', entity: 'news', entityId: item.id });
  return NextResponse.json(item, { status: 201 });
}
