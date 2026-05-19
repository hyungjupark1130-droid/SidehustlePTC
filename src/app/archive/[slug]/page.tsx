import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
    include: { images: { take: 1, orderBy: { order: 'asc' } } }
  });
  
  if (!artist) return {};
  
  const title = `${artist.firstName} ${artist.lastName}`;
  const image = artist.images[0]?.url ? getImageUrl(artist.images[0].url) : undefined;
  
  return {
    title,
    description: artist.bio?.substring(0, 160) || `Archive entry for ${title}`,
    openGraph: {
      title,
      description: artist.bio?.substring(0, 160) || `Archive entry for ${title}`,
      images: image ? [{ url: image }] : [],
    }
  };
}

export const revalidate = 60;

export default async function ArtistDetailPage({ params }: Props) {
  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      works: { orderBy: { year: 'desc' } },
      projects: {
        include: { project: true }
      },
      publications: true
    }
  });

  if (!artist) {
    notFound();
  }

  const name = `${artist.firstName} ${artist.lastName}`;
  const dates = [artist.birthYear, artist.deathYear].filter(Boolean).join('–');
  
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <header className="mb-16">
        <h1 
          className="font-display font-black leading-none mb-4"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          {name}
        </h1>
        <div className="flex gap-4 font-body font-light text-sm tracking-widest uppercase opacity-60">
          {dates && <span>{dates}</span>}
          {artist.nationality && <span>{artist.nationality}</span>}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        {/* Left Column: Bio & Metadata */}
        <div className="lg:col-span-4 flex flex-col gap-12">
          {artist.bio && (
            <div className="font-body font-light leading-relaxed text-base">
              {artist.bio.split('\n\n').map((paragraph: any, i: any) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>
          )}

          {artist.projects.length > 0 && (
            <div>
              <h2 className="font-body font-medium text-xs tracking-widest uppercase mb-4">Related Projects</h2>
              <ul className="flex flex-col gap-2">
                {artist.projects.map(({ project }: any) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.slug}`} className="font-body font-light hover:underline underline-offset-4">
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {artist.publications.length > 0 && (
            <div>
              <h2 className="font-body font-medium text-xs tracking-widest uppercase mb-4">Related Publications</h2>
              <ul className="flex flex-col gap-2">
                {artist.publications.map((pub: any) => (
                  <li key={pub.id}>
                    <Link href={`/publications/${pub.slug}`} className="font-body font-light hover:underline underline-offset-4">
                      {pub.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Images & Works */}
        <div className="lg:col-span-8 flex flex-col gap-16">
          {artist.images.map((img: any) => (
            <figure key={img.id} className="w-full">
              <div className="relative w-full aspect-[4/3] bg-black/5 mb-3">
                <Image
                  src={getImageUrl(img.url)}
                  alt={img.alt || name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              {img.alt && (
                <figcaption className="font-body font-light text-xs text-black/60">
                  {img.alt}
                </figcaption>
              )}
            </figure>
          ))}
          
          {artist.works.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display font-black text-3xl mb-8">Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {artist.works.map((work: any) => (
                  <article key={work.id}>
                    {work.imageUrl && (
                      <div className="relative w-full aspect-square bg-black/5 mb-4">
                        <Image
                          src={getImageUrl(work.imageUrl)}
                          alt={work.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <h3 className="font-body font-medium text-sm leading-tight italic">
                      {work.title}{work.year ? `, ${work.year}` : ''}
                    </h3>
                    <p className="font-body font-light text-xs text-black/60 mt-1">
                      {[work.medium, work.dimensions].filter(Boolean).join(', ')}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
