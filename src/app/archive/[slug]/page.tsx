import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

interface TimelineEvent {
  date: Date;
  label: string;
  href?: string;
}

function formatTimelineDate(d: Date) {
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function ArtistTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section className="pt-16 pb-8 border-t border-black/10">
      <p className="font-body font-medium text-[10px] tracking-widest uppercase opacity-30 mb-8">Timeline</p>
      <div className="overflow-x-auto">
        <div style={{ minWidth: `${Math.max(events.length * 140, 400)}px` }}>
          {/* Labels above the line (even-indexed events) */}
          <div className="flex">
            {events.map((ev, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center px-2 pb-1" style={{ minHeight: 72 }}>
                {i % 2 === 0 && (
                  <>
                    {ev.href ? (
                      <Link href={ev.href} className="font-body font-light text-[10px] leading-tight text-center hover:underline underline-offset-2 line-clamp-2">
                        {ev.label}
                      </Link>
                    ) : (
                      <span className="font-body font-light text-[10px] leading-tight text-center line-clamp-2">{ev.label}</span>
                    )}
                    <span className="font-body font-light text-[9px] tracking-widest uppercase opacity-40 text-center leading-none mt-1.5">
                      {formatTimelineDate(ev.date)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Dot row with horizontal line */}
          <div className="relative flex" style={{ height: 44 }}>
            <div className="absolute left-0 right-0 h-px bg-black/15" style={{ top: 21 }} />
            {events.map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative z-10">
                <div className="w-px bg-black/20" style={{ height: 16, visibility: i % 2 === 0 ? 'visible' : 'hidden' }} />
                <div className="w-2.5 h-2.5 rounded-full border border-black bg-white flex-shrink-0" />
                <div className="w-px bg-black/20" style={{ height: 16, visibility: i % 2 !== 0 ? 'visible' : 'hidden' }} />
              </div>
            ))}
          </div>

          {/* Labels below the line (odd-indexed events) */}
          <div className="flex">
            {events.map((ev, i) => (
              <div key={i} className="flex-1 flex flex-col justify-start items-center px-2 pt-1" style={{ minHeight: 72 }}>
                {i % 2 !== 0 && (
                  <>
                    <span className="font-body font-light text-[9px] tracking-widest uppercase opacity-40 text-center leading-none mb-1.5">
                      {formatTimelineDate(ev.date)}
                    </span>
                    {ev.href ? (
                      <Link href={ev.href} className="font-body font-light text-[10px] leading-tight text-center hover:underline underline-offset-2 line-clamp-2">
                        {ev.label}
                      </Link>
                    ) : (
                      <span className="font-body font-light text-[10px] leading-tight text-center line-clamp-2">{ev.label}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

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

export const dynamic = 'force-dynamic';

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

  const timelineEvents: TimelineEvent[] = [
    { date: new Date(artist.createdAt), label: 'Joined Side Hustle Practice' },
    ...artist.publications
      .filter((p: any) => p.publishedAt)
      .map((p: any) => ({ date: new Date(p.publishedAt), label: p.title, href: `/publications/${p.slug}` })),
    ...artist.projects
      .filter(({ project }: any) => project.startDate)
      .map(({ project }: any) => ({ date: new Date(project.startDate), label: project.title, href: `/projects/${project.slug}` })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
  
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
          
        </div>

        {/* Right Column: Images & Works */}
        <div className="lg:col-span-8 flex flex-col gap-16">
          {artist.images.map((img: any) => (
            <figure key={img.id} className="w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(img.url)}
                alt={img.alt || name}
                className="w-full h-auto block mb-3"
              />
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
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getImageUrl(work.imageUrl)}
                        alt={work.title}
                        className="w-full h-auto block mb-4"
                      />
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

      <ArtistTimeline events={timelineEvents} />

      {artist.publications.length > 0 && (
        <section className="pt-16 border-t border-black/10">
          <h2 className="font-body font-medium text-xs tracking-widest uppercase mb-8">Related Articles & Publications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artist.publications.map((pub: any) => (
              <Link key={pub.id} href={`/publications/${pub.slug}`} className="group flex flex-col gap-3">
                {pub.coverUrl && (
                  <div className="relative w-full aspect-[3/2] bg-black/5 overflow-hidden">
                    <Image
                      src={getImageUrl(pub.coverUrl)}
                      alt={pub.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-body font-medium text-sm leading-tight group-hover:underline underline-offset-2">{pub.title}</h3>
                  {pub.publishedAt && (
                    <p className="font-body font-light text-xs tracking-widest uppercase opacity-40 mt-1">
                      {new Date(pub.publishedAt).getFullYear()}
                    </p>
                  )}
                  {pub.authors?.length > 0 && (
                    <p className="font-body font-light text-xs opacity-60 mt-0.5">{pub.authors.join(', ')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
