import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { UserForm } from '@/components/admin/UserForm';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';
export const metadata = { title: 'Edit User — Admin' };
export default async function EditUserPage({ params }: { params: { id: string } }) {
  const { allowed, role } = await checkPermission('users', 'update');
  if (!allowed || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) redirect('/admin/users');
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { permissions: true },
  });
  if (!user) notFound();
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">{user.email}</h1>
      <UserForm user={user} />
    </div>
  );
}
