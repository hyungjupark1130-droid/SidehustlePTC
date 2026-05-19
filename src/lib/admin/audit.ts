import { prisma } from '@/lib/prisma';

export async function writeAudit({
  userId,
  action,
  entity,
  entityId,
  metadata,
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, metadata },
  });
}
