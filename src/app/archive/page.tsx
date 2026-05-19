import { prisma } from '@/lib/prisma';
import { ArchiveView } from '@/components/ArchiveView';

export const metadata = {
  title: 'Archive',
};

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  const artists = await prisma.artist.findMany({
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      nationality: true,
      featured: true,
    },
    orderBy: {
      lastName: 'asc',
    },
  });

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <h1 className="sr-only">Archive</h1>
      <ArchiveView artists={artists} />
    </main>
  );
}
