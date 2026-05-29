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

  const fontSizes: Record<string, string> = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' };
  const lineHeights: Record<string, string> = { tight: '1.25', normal: '1.5', relaxed: '1.625', loose: '2' };
  const descriptionStyle = {
    fontSize: fontSizes[pub.fontSize ?? ''] ?? '1rem',
    lineHeight: lineHeights[pub.lineHeight ?? ''] ?? '1.625',
    textAlign: (pub.textAlign === 'center' ? 'center' : pub.textAlign === 'right' ? 'right' : 'left') as 'left' | 'center' | 'right',
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-4xl">
      <Link href="/publications" className="font-body font-light text-xs tracking-widest uppercase hover:underline underline-offset-4 mb-12 block">
        ← Publications
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {pub.coverUrl && (
          <div className="relative w-full aspect-[3/4] bg-black/5">
            <Image src={getImageUrl(pub.coverUrl)} alt={pub.title} fill className="object-contain" sizes="50vw" />
          </div>
        )}
        <div>
          <h1 className="font-display font-black leading-none mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>{pub.title}</h1>
          {pub.authors.length > 0 && <p className="font-body font-light text-sm mb-2">{pub.authors.join(', ')}</p>}
          {pub.publishedAt && <p className="font-body font-light text-xs tracking-widest uppercase opacity-40 mb-8">{new Date(pub.publishedAt).getFullYear()}</p>}
          {pub.description && <p className="font-body font-light mb-8" style={descriptionStyle}>{pub.description}</p>}
          {pub.externalUrl && (
            <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer" className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4">
              View / Purchase →
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
