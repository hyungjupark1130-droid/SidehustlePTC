import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import Link from 'next/link';
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Pages — Admin' };

export default async function AdminPagesPage() {
  const { allowed } = await checkPermission('pages', 'read');
  if (!allowed) redirect('/admin');

  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' } });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl leading-none">Pages</h1>
      </div>

      {pages.length === 0 ? (
        <p className="text-xs font-body opacity-40">No pages found.</p>
      ) : (
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-black">
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Title
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Slug
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-black/10">
                <td className="py-3">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="hover:underline underline-offset-2"
                  >
                    {page.title}
                  </Link>
                </td>
                <td className="py-3 opacity-60">/{page.slug}</td>
                <td className="py-3">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="text-xs uppercase tracking-widest hover:underline underline-offset-2"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
