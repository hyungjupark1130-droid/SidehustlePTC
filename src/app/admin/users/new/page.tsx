import { UserForm } from '@/components/admin/UserForm';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
export const metadata = { title: 'New User — Admin' };
export default async function NewUserPage() {
  const { allowed, role } = await checkPermission('users', 'create');
  if (!allowed || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) redirect('/admin/users');
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">New User</h1>
      <UserForm />
    </div>
  );
}
