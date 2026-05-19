import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { ArtistForm } from '@/components/admin/ArtistForm';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Edit Artist — Admin' };

export default async function EditArtistPage({ params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('artists', 'update');
  if (!allowed) redirect('/admin/artists');

  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: 'asc' } } },
  });
  if (!artist) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">
        {artist.firstName} {artist.lastName}
      </h1>
      <ArtistForm artist={artist} />
    </div>
  );
}
