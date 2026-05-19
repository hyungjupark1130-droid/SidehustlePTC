import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'ARTIST']),
  expiresAt: z.string().nullable().optional(),
  permissions: z.array(z.object({ resource: z.string(), actions: z.array(z.string()) })).optional(),
});

export async function POST(req: NextRequest) {
  const { allowed, userId, role } = await checkPermission('users', 'create');
  if (!allowed || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      isActive: true,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  if (parsed.data.permissions?.length) {
    await prisma.permission.createMany({
      data: parsed.data.permissions.map((p) => ({
        userId: user.id,
        resource: p.resource,
        actions: p.actions,
      })),
    });
  }

  await writeAudit({ userId, action: 'create', entity: 'user', entityId: user.id });
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
