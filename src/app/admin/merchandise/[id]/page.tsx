import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { MerchandiseForm } from '@/components/admin/MerchandiseForm';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Edit Merchandise — Admin' };

export default async function EditMerchandisePage({ params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('merchandise', 'update');
  if (!allowed) redirect('/admin/merchandise');

  const item = await prisma.merchandiseItem.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  // Serialize Decimal to string for client component
  const serialized = { ...item, price: item.price.toString() };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">{item.title}</h1>
      <MerchandiseForm item={serialized} />
    </div>
  );
}
