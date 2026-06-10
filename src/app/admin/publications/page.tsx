import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import Link from 'next/link';
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { writeAudit } from '@/lib/admin/audit';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const metadata = { title: 'Publications — Admin' };

async function deletePublication(formData: FormData) {
  'use server';
  const { allowed, userId } = await checkPermission('publications', 'delete');
  if (!allowed) return;
  const id = formData.get('id') as string;
  await prisma.publication.delete({ where: { id } });
  await writeAudit({ userId, action: 'delete', entity: 'publication', entityId: id });
  revalidatePath('/admin/publications');
}

export default async function AdminPublicationsPage() {
  const { allowed } = await checkPermission('publications', 'read');
  if (!allowed) redirect('/admin');

  const publications = await prisma.publication.findMany({ orderBy: { publishedAt: 'desc' } });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl leading-none">Publications</h1>
        <Link
          href="/admin/publications/new"
          className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors"
        >
          + New Publication
        </Link>
      </div>

      {publications.length === 0 ? (
        <p className="text-xs font-body opacity-40">No publications yet.</p>
      ) : (
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-black">
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Title
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Authors
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Published
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                What&apos;s Up
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {publications.map((pub) => (
              <tr key={pub.id} className="border-b border-black/10">
                <td className="py-3">
                  <Link
                    href={`/admin/publications/${pub.id}`}
                    className="hover:underline underline-offset-2"
                  >
                    {pub.title}
                  </Link>
                </td>
                <td className="py-3 opacity-60">{pub.authors.join(', ') || '—'}</td>
                <td className="py-3 opacity-60">
                  {pub.publishedAt
                    ? new Date(pub.publishedAt).toLocaleDateString('en-GB')
                    : '—'}
                </td>
                <td className="py-3">
                  {pub.featuredInWhatsUp ? (
                    <span className="inline-block text-xs tracking-widest uppercase font-body bg-black text-white px-2 py-0.5">
                      Featured
                    </span>
                  ) : (
                    <span className="opacity-30 text-xs font-body">—</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/publications/${pub.id}`}
                      className="text-xs uppercase tracking-widest hover:underline underline-offset-2"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={pub.id} action={deletePublication} confirmMessage="Delete this publication?" />
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
