'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArtistSummary } from '@/lib/types';
import { getImageUrl } from '@/lib/getImageUrl';
import { useArchive } from '@/components/ArchiveProvider';

interface ArtistPreviewData {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  nationality: string | null;
  createdAt: string;
  images: { url: string; alt: string }[];
  publications: { title: string; slug: string; publishedAt: string | null }[];
}

interface TimelineEvent {
  date: Date;
  label: string;
  type: 'joined' | 'publication';
  href?: string;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function HorizontalTimeline({ events, onLinkClick }: { events: TimelineEvent[]; onLinkClick?: () => void }) {
  if (events.length === 0) return null;
  const n = events.length;

  return (
    <div>
      <p className="font-body font-light text-[10px] tracking-widest uppercase opacity-30 mb-5">
        Timeline
      </p>

      {/* Dates row */}
      <div className="flex items-end mb-2">
        {events.map((event, i) => (
          <div key={i} className="flex-1 flex justify-center px-1">
            <p className="font-body font-light text-[9px] tracking-widest uppercase opacity-40 leading-none text-center">
              {formatDate(event.date)}
            </p>
          </div>
        ))}
        {/* spacer for arrow */}
        <div className="w-5 flex-shrink-0" />
      </div>

      {/* Line + dots row */}
      <div className="flex items-center">
        {events.map((event, i) => (
          <div key={i} className="flex-1 flex items-center relative">
            {/* Left half-line (connects to previous dot) */}
            {i > 0 && (
              <div className="absolute left-0 w-1/2 h-px bg-black/25 top-1/2 -translate-y-1/2" />
            )}
            {/* Right half-line (connects to next dot) */}
            {i < n - 1 && (
              <div className="absolute right-0 w-1/2 h-px bg-black/25 top-1/2 -translate-y-1/2" />
            )}
            {/* Dot */}
            <div className="relative z-10 w-full flex justify-center">
              <div className="w-[7px] h-[7px] rounded-full bg-black flex-shrink-0" />
            </div>
          </div>
        ))}
        {/* Arrow tail + head */}
        <div className="flex-shrink-0 flex items-center w-5">
          <div className="flex-1 h-px bg-black/25" />
          <svg width="5" height="7" viewBox="0 0 5 7" fill="none" className="flex-shrink-0">
            <path d="M0 0.5 L4.5 3.5 L0 6.5" stroke="rgba(0,0,0,0.35)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels row */}
      <div className="flex items-start mt-2">
        {events.map((event, i) => (
          <div key={i} className="flex-1 flex justify-center px-1">
            {event.href ? (
              <Link
                href={event.href}
                onClick={onLinkClick}
                className="font-body font-light text-[10px] leading-tight hover:underline underline-offset-2 text-center line-clamp-2 block"
              >
                {event.label}
              </Link>
            ) : (
              <p className="font-body font-light text-[10px] leading-tight text-center line-clamp-2">
                {event.label}
              </p>
            )}
          </div>
        ))}
        <div className="w-5 flex-shrink-0" />
      </div>
    </div>
  );
}

export function ArtistPreviewPanel({ artist }: { artist: ArtistSummary | null }) {
  const { closeArchive } = useArchive();
  const [data, setData] = useState<ArtistPreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artist) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/archive/artists/${artist.slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [artist?.slug]);

  if (!artist) {
    return (
      <div className="flex items-center justify-center min-h-[16rem] opacity-20">
        <p className="font-body font-light text-xs tracking-widest uppercase text-center leading-loose">
          Click an artist<br />to preview
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="w-full aspect-[3/4] bg-black/5" />
        <div className="h-3 w-2/3 bg-black/10" />
        <div className="h-2 w-1/2 bg-black/5" />
      </div>
    );
  }

  if (!data) return null;

  const firstBioPara = data.bio?.split('\n\n')[0] ?? '';
  const bioSnippet =
    firstBioPara.length > 220 ? firstBioPara.slice(0, 220) + '…' : firstBioPara;

  const timeline: TimelineEvent[] = [
    {
      date: new Date(data.createdAt),
      label: 'Joined Side Hustle Practice',
      type: 'joined' as const,
    },
    ...data.publications
      .filter((p) => p.publishedAt)
      .map((p) => ({
        date: new Date(p.publishedAt!),
        label: p.title,
        type: 'publication' as const,
        href: `/publications/${p.slug}`,
      })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const imageUrl = data.images[0] ? getImageUrl(data.images[0].url) : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.slug}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-7"
      >
        {/* Portrait + name side by side */}
        <div className="flex gap-5 items-start">
          {imageUrl && (
            <Link href={`/archive/${data.slug}`} onClick={closeArchive} tabIndex={-1} className="flex-shrink-0">
              <div className="relative w-24 h-32 overflow-hidden bg-black/5">
                <Image
                  src={imageUrl}
                  alt={`${data.firstName} ${data.lastName}`}
                  fill
                  className="object-cover transition-opacity duration-300 hover:opacity-80"
                  sizes="96px"
                />
              </div>
            </Link>
          )}

          <div className="flex flex-col justify-start pt-1 min-w-0">
            <Link href={`/archive/${data.slug}`} onClick={closeArchive} className="hover:underline underline-offset-4">
              <h2 className="font-display font-black text-2xl leading-tight">
                {data.firstName} {data.lastName}
              </h2>
            </Link>
            {data.nationality && (
              <p className="font-body font-light text-xs tracking-widest uppercase opacity-40 mt-1">
                {data.nationality}
              </p>
            )}
            {bioSnippet && (
              <p className="font-body font-light text-xs leading-relaxed opacity-60 mt-3">
                {bioSnippet}
              </p>
            )}
          </div>
        </div>

        {/* Horizontal timeline */}
        <div className="border-t border-black/10 pt-6">
          <HorizontalTimeline events={timeline} onLinkClick={closeArchive} />
        </div>

        {/* View profile */}
        <div>
          <Link
            href={`/archive/${data.slug}`}
            onClick={closeArchive}
            className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 hover:tracking-[0.2em] transition-all duration-300"
          >
            View Profile →
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
