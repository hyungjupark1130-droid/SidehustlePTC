import { PublicationForm } from '@/components/admin/PublicationForm';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export const metadata = { title: 'New Publication — Admin' };

export default async function NewPublicationPage() {
  const { allowed } = await checkPermission('publications', 'create');
  if (!allowed) redirect('/admin/publications');
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">New Publication</h1>
      <PublicationForm />
    </div>
  );
}
