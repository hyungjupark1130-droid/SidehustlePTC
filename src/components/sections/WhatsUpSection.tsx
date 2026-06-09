import Image from 'next/image';
import Link from 'next/link';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  body: string;
  publishedAt: Date;
  image?: string | null;
}

interface WhatsUpSectionProps {
  items: NewsItem[];
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
                <Link href={`/whats-up/${item.slug}`} className="block mb-6 overflow-hidden">
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
              <time
                dateTime={new Date(item.publishedAt).toISOString()}
                className="block font-body font-light text-xs tracking-widest uppercase mb-3"
              >
                {formatDate(item.publishedAt)}
              </time>
              <h3 className="font-display font-black text-xl md:text-2xl leading-tight mb-3">
                <Link
                  href={`/whats-up/${item.slug}`}
                  className="hover:underline underline-offset-4"
                >
                  {item.title}
                </Link>
              </h3>
              <p className="font-body font-light text-sm leading-relaxed line-clamp-3">
                {stripHtml(item.body)}
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
