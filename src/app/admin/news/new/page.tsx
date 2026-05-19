import { NewsForm } from '@/components/admin/NewsForm';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export const metadata = { title: 'New News Item — Admin' };

export default async function NewNewsPage() {
  const { allowed } = await checkPermission('news', 'create');
  if (!allowed) redirect('/admin/news');
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">New Item</h1>
      <NewsForm />
    </div>
  );
}
