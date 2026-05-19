import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import Link from 'next/link';
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { writeAudit } from '@/lib/admin/audit';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const metadata = { title: 'Merchandise — Admin' };

async function deleteMerchandise(formData: FormData) {
  'use server';
  const { allowed, userId } = await checkPermission('merchandise', 'delete');
  if (!allowed) return;
  const id = formData.get('id') as string;
  await prisma.merchandiseItem.delete({ where: { id } });
  await writeAudit({ userId, action: 'delete', entity: 'merchandise', entityId: id });
  revalidatePath('/admin/merchandise');
}

export default async function AdminMerchandisePage() {
  const { allowed } = await checkPermission('merchandise', 'read');
  if (!allowed) redirect('/admin');

  const items = await prisma.merchandiseItem.findMany({ orderBy: { title: 'asc' } });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl leading-none">Merchandise</h1>
        <Link
          href="/admin/merchandise/new"
          className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors"
        >
          + New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-xs font-body opacity-40">No merchandise yet.</p>
      ) : (
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-black">
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Title
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Price
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                In Stock
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-black/10">
                <td className="py-3">
                  <Link
                    href={`/admin/merchandise/${item.id}`}
                    className="hover:underline underline-offset-2"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="py-3 opacity-60">
                  {item.price !== null ? `£${Number(item.price).toFixed(2)}` : '—'}
                </td>
                <td className="py-3">{item.inStock ? '✓' : '—'}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/merchandise/${item.id}`}
                      className="text-xs uppercase tracking-widest hover:underline underline-offset-2"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={item.id} action={deleteMerchandise} confirmMessage="Delete this item?" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
