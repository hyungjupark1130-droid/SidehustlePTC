import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { PublicationForm } from '@/components/admin/PublicationForm';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Edit Publication — Admin' };

export default async function EditPublicationPage({ params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('publications', 'update');
  if (!allowed) redirect('/admin/publications');

  const publication = await prisma.publication.findUnique({ where: { id: params.id } });
  if (!publication) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">{publication.title}</h1>
      <PublicationForm publication={publication} />
    </div>
  );
}
