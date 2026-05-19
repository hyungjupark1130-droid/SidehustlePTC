import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { NewsForm } from '@/components/admin/NewsForm';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Edit News — Admin' };

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('news', 'update');
  if (!allowed) redirect('/admin/news');

  const item = await prisma.newsItem.findUnique({ where: { id: params.id } });
  if (!item) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">{item.title}</h1>
      <NewsForm item={item} />
    </div>
  );
}
