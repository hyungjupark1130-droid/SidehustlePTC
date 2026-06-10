import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pub = await prisma.publication.findUnique({ where: { slug: params.slug } });
  if (!pub) return {};
  return { title: pub.title };
}

export default async function PublicationDetailPage({ params }: Props) {
  const pub = await prisma.publication.findUnique({
    where: { slug: params.slug },
    include: { artists: true },
  });
  if (!pub) notFound();

  // Wrap plain-text descriptions (no HTML tags) in paragraphs for uniform rendering
  const isHtml = pub.description?.trimStart().startsWith('<');
  const descriptionHtml = pub.description
    ? isHtml
      ? pub.description
      : pub.description.split('\n\n').map((p) => `<p>${p}</p>`).join('')
    : null;

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <Link href="/publications" className="font-body font-light text-xs tracking-widest uppercase hover:underline underline-offset-4 mb-12 block">
        ← Publications
      </Link>

      {/* Header: cover image + title/meta side by side */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 mb-16 items-start">
        {pub.coverUrl && (
          <div className="relative w-48 md:w-64 aspect-[3/4] bg-black/5 shrink-0">
            <Image src={getImageUrl(pub.coverUrl)} alt={pub.title} fill className="object-contain" sizes="256px" />
          </div>
        )}
        <div className="flex flex-col justify-end pb-2">
          <h1 className="font-display font-black leading-none mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>{pub.title}</h1>
          {pub.authors.length > 0 && <p className="font-body font-light text-sm mb-2">{pub.authors.join(', ')}</p>}
          {pub.publishedAt && <p className="font-body font-light text-xs tracking-widest uppercase opacity-40 mb-4">{new Date(pub.publishedAt).getFullYear()}</p>}
          {pub.externalUrl && (
            <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer" className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 self-start">
              View / Purchase →
            </a>
          )}
        </div>
      </div>

      {/* Body text: full width */}
      {descriptionHtml && (
        <div
          className="publication-body font-body font-light border-t border-black/10 pt-12"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      )}
    </main>
  );
}
