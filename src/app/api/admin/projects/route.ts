import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  featured: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
  const { allowed, userId } = await checkPermission('projects', 'create');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const project = await prisma.project.create({
    data: {
      slug: slugify(parsed.data.title),
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? 'active',
      featured: parsed.data.featured ?? false,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  await writeAudit({ userId, action: 'create', entity: 'project', entityId: project.id });
  return NextResponse.json(project, { status: 201 });
}
