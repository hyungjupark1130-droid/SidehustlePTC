import { MerchandiseForm } from '@/components/admin/MerchandiseForm';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export const metadata = { title: 'New Merchandise Item — Admin' };

export default async function NewMerchandisePage() {
  const { allowed } = await checkPermission('merchandise', 'create');
  if (!allowed) redirect('/admin/merchandise');
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">New Item</h1>
      <MerchandiseForm />
    </div>
  );
}
