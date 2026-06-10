import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).optional(),
  publishedAt: z.string().optional(),
  description: z.string().optional(),
  externalUrl: z.string().optional(),
  coverUrl: z.string().nullable().optional(),
  fontSize: z.string().optional(),
  lineHeight: z.string().optional(),
  textAlign: z.string().optional(),
  featuredInWhatsUp: z.boolean().optional(),
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
  const { allowed, userId } = await checkPermission('publications', 'create');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const publication = await prisma.publication.create({
    data: {
      slug: slugify(parsed.data.title),
      title: parsed.data.title,
      authors: parsed.data.authors ?? [],
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
      description: parsed.data.description ?? null,
      externalUrl: parsed.data.externalUrl || null,
      coverUrl: parsed.data.coverUrl ?? null,
      fontSize: parsed.data.fontSize ?? null,
      lineHeight: parsed.data.lineHeight ?? null,
      textAlign: parsed.data.textAlign ?? null,
      featuredInWhatsUp: parsed.data.featuredInWhatsUp ?? false,
    },
  });

  await writeAudit({ userId, action: 'create', entity: 'publication', entityId: publication.id });
  return NextResponse.json(publication, { status: 201 });
}
