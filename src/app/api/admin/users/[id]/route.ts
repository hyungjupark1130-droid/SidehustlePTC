import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';
import { writeAudit } from '@/lib/admin/audit';

const updateSchema = z.object({
  password: z.string().min(8).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'ARTIST']).optional(),
  expiresAt: z.string().nullable().optional(),
  permissions: z.array(z.object({ resource: z.string(), actions: z.array(z.string()) })).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { allowed, userId, role } = await checkPermission('users', 'update');
  if (!allowed || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (parsed.data.role) updateData.role = parsed.data.role;
  if (parsed.data.expiresAt !== undefined) updateData.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  if (parsed.data.password) updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({ where: { id: params.id }, data: updateData });

  if (parsed.data.permissions !== undefined) {
    await prisma.permission.deleteMany({ where: { userId: params.id } });
    if (parsed.data.permissions.length > 0) {
      await prisma.permission.createMany({
        data: parsed.data.permissions.map((p) => ({
          userId: params.id,
          resource: p.resource,
          actions: p.actions,
        })),
      });
    }
  }

  await writeAudit({ userId, action: 'update', entity: 'user', entityId: params.id });
  return NextResponse.json({ success: true });
}
