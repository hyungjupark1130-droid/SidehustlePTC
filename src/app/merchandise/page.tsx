import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: 'Merchandise' };
export const dynamic = 'force-dynamic';

export default async function MerchandisePage() {
  const items = await prisma.merchandiseItem.findMany({ orderBy: { title: 'asc' } });

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <h1
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        Merchandise
      </h1>
      {items.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">Shop coming soon.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item) => {
            const href = item.externalUrl ?? `/merchandise/${item.slug}`;
            return (
              <article key={item.id}>
                <Link href={href} target={item.externalUrl ? '_blank' : undefined} rel={item.externalUrl ? 'noopener noreferrer' : undefined} className="block group">
                  {item.imageUrl && (
                    <div className="relative w-full aspect-square overflow-hidden mb-4 bg-black/5">
                      <Image src={getImageUrl(item.imageUrl)} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="25vw" />
                    </div>
                  )}
                  <h2 className="font-body font-light text-sm leading-tight mb-1">{item.title}</h2>
                  <p className="font-body font-medium text-sm">£{Number(item.price).toFixed(2)}</p>
                  {!item.inStock && <p className="font-body font-light text-xs tracking-widest uppercase opacity-40 mt-1">Out of stock</p>}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
