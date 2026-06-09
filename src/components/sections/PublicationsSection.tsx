import Image from 'next/image';
import Link from 'next/link';

interface Publication {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  publishedAt?: Date | null;
  coverUrl: string | null;
  description?: string | null;
  externalUrl?: string | null;
}

interface PublicationsSectionProps {
  publications: Publication[];
}

export function PublicationsSection({ publications }: PublicationsSectionProps) {
  return (
    <section
      id="publications"
      className="mx-6 md:mx-12 py-32 border-t border-black"
      aria-labelledby="publications-heading"
    >
      <h2
        id="publications-heading"
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        Publications
      </h2>

      {publications.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">
          No publications yet.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-8">
          {publications.map((pub) => {
            const href = pub.externalUrl || `/publications/${pub.slug}`;
            const isExternal = !!pub.externalUrl;
            return (
              <article key={pub.id}>
                <Link
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="block group"
                >
                  {pub.coverUrl && (
                    <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-black/5">
                      <Image
                        src={pub.coverUrl}
                        alt={pub.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <h3 className="font-display font-black text-base leading-tight mb-1">
                    {pub.title}
                  </h3>
                  {pub.authors.length > 0 && (
                    <p className="font-body font-light text-xs tracking-wide">
                      {pub.authors.join(', ')}
                    </p>
                  )}
                  {pub.publishedAt && (
                    <p className="font-body font-light text-xs tracking-widest uppercase opacity-50 mt-1">
                      {new Date(pub.publishedAt).getFullYear()}
                    </p>
                  )}
                </Link>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-16">
        <Link
          href="/publications"
          className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 hover:tracking-[0.25em] transition-all duration-300"
        >
          All Publications →
        </Link>
      </div>
    </section>
  );
}
