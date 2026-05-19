import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const artistSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bio: z.string().optional(),
  birthYear: z.number().nullable().optional(),
  deathYear: z.number().nullable().optional(),
  nationality: z.string().optional(),
  featured: z.boolean().optional(),
});

function slugify(firstName: string, lastName: string) {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  const { allowed, userId } = await checkPermission('artists', 'create');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = artistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const slug = slugify(parsed.data.firstName, parsed.data.lastName);

  const artist = await prisma.artist.create({
    data: {
      slug,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      bio: parsed.data.bio ?? null,
      birthYear: parsed.data.birthYear ?? null,
      deathYear: parsed.data.deathYear ?? null,
      nationality: parsed.data.nationality ?? null,
      featured: parsed.data.featured ?? false,
    },
  });

  await writeAudit({ userId, action: 'create', entity: 'artist', entityId: artist.id });
  return NextResponse.json(artist, { status: 201 });
}
