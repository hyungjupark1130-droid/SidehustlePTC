import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!project) return {};
  return { title: project.title, description: project.description?.substring(0, 160) ?? '' };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: { artists: { include: { artist: { include: { images: { take: 1, orderBy: { order: 'asc' } } } } } } },
  });
  if (!project) notFound();

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl">
      <Link href="/projects" className="font-body font-light text-xs tracking-widest uppercase hover:underline underline-offset-4 mb-12 block">
        ← Projects
      </Link>
      <header className="mb-16">
        <h1
          className="font-display font-black text-black leading-none mb-4"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          {project.title}
        </h1>
        <span className="font-body font-light text-xs tracking-widest uppercase opacity-40">{project.status}</span>
      </header>

      {project.description && (
        <div className="font-body font-light text-base leading-relaxed max-w-2xl mb-16 space-y-4">
          {project.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}

      {project.artists.length > 0 && (
        <section className="border-t border-black pt-12">
          <h2 className="font-body font-light text-xs tracking-widest uppercase mb-8">Artists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {project.artists.map(({ artist }) => (
              <Link key={artist.id} href={`/archive/${artist.slug}`} className="group">
                {artist.images[0] && (
                  <div className="relative w-full aspect-square overflow-hidden mb-3 bg-black/5">
                    <Image
                      src={getImageUrl(artist.images[0].url)}
                      alt={artist.images[0].alt || `${artist.firstName} ${artist.lastName}`}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-400"
                      sizes="25vw"
                    />
                  </div>
                )}
                <p className="font-body font-light text-xs">
                  {artist.firstName} <span className="font-medium">{artist.lastName}</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
