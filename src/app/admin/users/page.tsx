import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import Link from 'next/link';
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { writeAudit } from '@/lib/admin/audit';
import { auth } from '@/lib/auth';
import { DeleteButton } from '@/components/admin/DeleteButton';

async function terminateUser(formData: FormData) {
  'use server';
  const { allowed, userId: actorId } = await checkPermission('users', 'update');
  if (!allowed) return;
  const id = formData.get('id') as string;

  // Cannot terminate yourself
  const session = await auth();
  if (session?.user && (session.user as any).id === id) return;

  await prisma.user.update({ where: { id }, data: { isActive: false } });

  // Invalidate all sessions for this user
  await prisma.session.deleteMany({ where: { userId: id } });

  await writeAudit({ userId: actorId, action: 'terminate', entity: 'user', entityId: id });
  revalidatePath('/admin/users');
}

export default async function AdminUsersPage() {
  const { allowed, role } = await checkPermission('users', 'read');
  if (!allowed || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) redirect('/admin');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { permissions: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl leading-none">Users</h1>
        <Link href="/admin/users/new" className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors">
          + New User
        </Link>
      </div>

      <table className="w-full text-sm font-body">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Email</th>
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Role</th>
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Status</th>
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Expires</th>
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-black/10">
              <td className="py-3">
                <Link href={`/admin/users/${user.id}`} className="hover:underline underline-offset-2">{user.email}</Link>
              </td>
              <td className="py-3 text-xs uppercase tracking-widest">{user.role}</td>
              <td className="py-3">
                {user.isActive
                  ? <span className="text-xs uppercase tracking-widest">Active</span>
                  : <span className="text-xs uppercase tracking-widest opacity-40">Inactive</span>}
              </td>
              <td className="py-3 opacity-60 text-xs">
                {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString('en-GB') : '—'}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/users/${user.id}`} className="text-xs uppercase tracking-widest hover:underline underline-offset-2">Edit</Link>
                  {user.isActive && (
                    <DeleteButton id={user.id} action={terminateUser} confirmMessage="Terminate this user? They will be immediately logged out." />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
