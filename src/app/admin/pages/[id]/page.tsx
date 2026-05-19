import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { PageForm } from '@/components/admin/PageForm';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Edit Page — Admin' };

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('pages', 'update');
  if (!allowed) redirect('/admin/pages');

  const page = await prisma.page.findUnique({ where: { id: params.id } });
  if (!page) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">{page.title}</h1>
      <PageForm page={page} />
    </div>
  );
}
