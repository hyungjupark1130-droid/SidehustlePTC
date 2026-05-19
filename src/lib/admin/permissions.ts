import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Resource = 'artists' | 'projects' | 'publications' | 'news' | 'merchandise' | 'pages' | 'users';
type Action = 'create' | 'read' | 'update' | 'delete';

export async function checkPermission(
  resource: Resource,
  action: Action
): Promise<{ allowed: boolean; userId?: string; role?: string }> {
  const session = await auth();
  if (!session?.user?.email) return { allowed: false };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { permissions: true },
  });

  if (!user || !user.isActive) return { allowed: false };
  if (user.expiresAt && user.expiresAt < new Date()) return { allowed: false };

  const role = user.role;

  // SUPER_ADMIN can do everything
  if (role === 'SUPER_ADMIN') return { allowed: true, userId: user.id, role };
  // ADMIN can do everything except manage users
  if (role === 'ADMIN' && resource !== 'users') return { allowed: true, userId: user.id, role };

  // EDITOR: check per-resource permissions
  const perm = user.permissions.find((p) => p.resource === resource);
  if (perm && perm.actions.includes(action)) return { allowed: true, userId: user.id, role };

  return { allowed: false };
}
