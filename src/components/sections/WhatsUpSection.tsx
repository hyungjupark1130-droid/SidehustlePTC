import Image from 'next/image';
import Link from 'next/link';

export interface WhatsUpItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: Date;
  image?: string | null;
  href: string;
  type: 'news' | 'publication';
}

interface WhatsUpSectionProps {
  items: WhatsUpItem[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function WhatsUpSection({ items }: WhatsUpSectionProps) {
  return (
    <section
      id="whats-up"
      className="mx-6 md:mx-12 py-32 border-t border-black"
      aria-labelledby="whats-up-heading"
    >
      <h2
        id="whats-up-heading"
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        What&apos;s Up
      </h2>

      {items.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">
          Nothing posted yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {items.map((item) => (
            <article key={item.id}>
              {item.image && (
                <Link href={item.href} className="block mb-6 overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </Link>
              )}
              <div className="flex items-center gap-3 mb-3">
                <time
                  dateTime={new Date(item.date).toISOString()}
                  className="block font-body font-light text-xs tracking-widest uppercase"
                >
                  {formatDate(item.date)}
                </time>
                {item.type === 'publication' && (
                  <span className="font-body font-light text-xs tracking-widest uppercase border border-black/30 px-1.5 py-0.5">
                    Publication
                  </span>
                )}
              </div>
              <h3 className="font-display font-black text-xl md:text-2xl leading-tight mb-3">
                <Link
                  href={item.href}
                  className="hover:underline underline-offset-4"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="font-body font-light text-sm leading-relaxed line-clamp-3">
                {stripHtml(item.excerpt)}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-16">
        <Link
          href="/whats-up"
          className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 hover:tracking-[0.25em] transition-all duration-300"
        >
          All News →
        </Link>
      </div>
    </section>
  );
}
