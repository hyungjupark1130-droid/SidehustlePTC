import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: "What&apos;s Up" };
export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
}

export default async function WhatsUpPage() {
  const items = await prisma.newsItem.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 text-center">
      <h1
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        What&apos;s Up
      </h1>

      {items.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">Nothing posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {items.map((item) => (
            <article key={item.id}>
              {item.image && (
                <Link href={`/whats-up/${item.slug}`} className="block mb-6 overflow-hidden">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={getImageUrl(item.image)}
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
              <h2 className="font-display font-black text-2xl leading-tight mb-3">
                <Link href={`/whats-up/${item.slug}`} className="hover:underline underline-offset-4">
                  {item.title}
                </Link>
              </h2>
              <p className="font-body font-light text-sm leading-relaxed line-clamp-3">{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
