import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { renderMarkdown } from '@/lib/renderMarkdown';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await prisma.newsItem.findUnique({ where: { slug: params.slug } });
  if (!item) return {};
  return { title: item.title, description: item.body.substring(0, 160) };
}

export default async function NewsItemPage({ params }: Props) {
  const item = await prisma.newsItem.findUnique({ where: { slug: params.slug } });
  if (!item) notFound();

  const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.publishedAt));

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
      <Link href="/whats-up" className="font-body font-light text-xs tracking-widest uppercase hover:underline underline-offset-4 mb-12 block">
        ← What&apos;s Up
      </Link>
      <time className="block font-body font-light text-xs tracking-widest uppercase mb-6 opacity-60">
        {date}
      </time>
      <h1
        className="font-display font-black text-black leading-none mb-12"
        style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
      >
        {item.title}
      </h1>
      {item.image && (
        <div className="relative w-full aspect-[16/9] mb-12 overflow-hidden">
          <Image src={getImageUrl(item.image)} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
        </div>
      )}
      <div className="space-y-6">
        {renderMarkdown(item.body)}
      </div>
    </main>
  );
}
