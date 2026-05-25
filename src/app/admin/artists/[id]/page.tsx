import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { ArtistForm } from '@/components/admin/ArtistForm';
import { ArtistPublicationsPanel } from '@/components/admin/ArtistPublicationsPanel';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Edit Artist — Admin' };

export default async function EditArtistPage({ params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('artists', 'update');
  if (!allowed) redirect('/admin/artists');

  const [artist, allPublications] = await Promise.all([
    prisma.artist.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        publications: { orderBy: { publishedAt: 'desc' } },
      },
    }),
    prisma.publication.findMany({ orderBy: { title: 'asc' } }),
  ]);

  if (!artist) notFound();

  const linkedIds = new Set(artist.publications.map((p) => p.id));
  const available = allPublications.filter((p) => !linkedIds.has(p.id));

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">
        {artist.firstName} {artist.lastName}
      </h1>
      <ArtistForm artist={artist} />
      <ArtistPublicationsPanel
        artistId={artist.id}
        linked={artist.publications}
        available={available}
      />
    </div>
  );
}
