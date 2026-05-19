import Image from 'next/image';
import Link from 'next/link';

interface MerchandiseItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price: string;
  imageUrl: string | null;
  externalUrl?: string | null;
  inStock: boolean;
}

interface MerchandiseSectionProps {
  items: MerchandiseItem[];
}

export function MerchandiseSection({ items }: MerchandiseSectionProps) {
  return (
    <section
      id="merchandise"
      className="mx-6 md:mx-12 py-32 border-t border-black"
      aria-labelledby="merchandise-heading"
    >
      <h2
        id="merchandise-heading"
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        Merchandise
      </h2>

      {items.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">
          Shop coming soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item) => {
            const href = item.externalUrl ?? `/merchandise/${item.slug}`;
            const isExternal = !!item.externalUrl;
            return (
              <article key={item.id}>
                <Link
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="block group"
                >
                  {item.imageUrl && (
                    <div className="relative w-full aspect-square overflow-hidden mb-4 bg-black/5">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <h3 className="font-body font-light text-sm leading-tight mb-1">
                    {item.title}
                  </h3>
                  <p className="font-body font-medium text-sm">
                    £{parseFloat(item.price).toFixed(2)}
                  </p>
                  {!item.inStock && (
                    <p className="font-body font-light text-xs tracking-widest uppercase opacity-40 mt-1">
                      Out of stock
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
          href="/merchandise"
          className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 hover:tracking-[0.25em] transition-all duration-300"
        >
          View All →
        </Link>
      </div>
    </section>
  );
}
