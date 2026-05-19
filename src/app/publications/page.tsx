import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: 'Publications' };
export const dynamic = 'force-dynamic';

export default async function PublicationsPage() {
  const publications = await prisma.publication.findMany({ orderBy: { publishedAt: 'desc' } });

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <h1
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        Publications
      </h1>
      {publications.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">No publications yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {publications.map((pub) => {
            const href = pub.externalUrl || `/publications/${pub.slug}`;
            return (
              <article key={pub.id}>
                <Link href={href} target={pub.externalUrl ? '_blank' : undefined} rel={pub.externalUrl ? 'noopener noreferrer' : undefined} className="block group">
                  {pub.coverUrl && (
                    <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-black/5">
                      <Image src={getImageUrl(pub.coverUrl)} alt={pub.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="25vw" />
                    </div>
                  )}
                  <h2 className="font-display font-black text-base leading-tight mb-1">{pub.title}</h2>
                  {pub.authors.length > 0 && <p className="font-body font-light text-xs tracking-wide">{pub.authors.join(', ')}</p>}
                  {pub.publishedAt && <p className="font-body font-light text-xs tracking-widest uppercase opacity-40 mt-1">{new Date(pub.publishedAt).getFullYear()}</p>}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
