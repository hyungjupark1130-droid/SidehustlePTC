'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useArchive } from '@/components/ArchiveProvider';

interface ArtistPreview {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  nationality?: string | null;
  featured: boolean;
  imageUrl: string | null;
  imageAlt: string;
}

interface ArchivePreviewSectionProps {
  artists: ArtistPreview[];
}

function ArtistThumbnail({ artist }: { artist: ArtistPreview }) {
  const prefersReduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <article
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/archive/${artist.slug}`}>
        {artist.imageUrl && (
          <div className="relative w-full aspect-square overflow-hidden mb-3">
            <Image
              src={artist.imageUrl}
              alt={artist.imageAlt}
              fill
              className="object-cover"
              style={{
                filter: hovered && !prefersReduced ? 'none' : 'grayscale(100%)',
                transition: 'filter 0.4s ease',
              }}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </div>
        )}
        {!artist.imageUrl && (
          <div className="w-full aspect-square mb-3 border border-black/10 flex items-end p-3">
            <span className="font-display font-black text-4xl leading-none opacity-10">
              {artist.lastName[0]}
            </span>
          </div>
        )}
        <p className="font-body font-light text-xs leading-tight tracking-wide">
          {artist.firstName}{' '}{artist.lastName}
        </p>
        {artist.nationality && (
          <p className="font-body font-light text-xs tracking-widest uppercase opacity-50">
            {artist.nationality}
          </p>
        )}
      </Link>
    </article>
  );
}

export function ArchivePreviewSection({ artists }: ArchivePreviewSectionProps) {
  const { openArchive } = useArchive();

  return (
    <section
      id="archive"
      className="mx-6 md:mx-12 py-32 border-t border-black"
      aria-labelledby="archive-preview-heading"
    >
      <div className="flex items-baseline justify-between mb-16">
        <h2
          id="archive-preview-heading"
          className="font-display font-black text-black leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          Archive
        </h2>
        <button
          onClick={openArchive}
          className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 hover:tracking-[0.25em] transition-all duration-300"
        >
          View Full Archive →
        </button>
      </div>

      {artists.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">
          Archive coming soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {artists.map((artist) => (
            <ArtistThumbnail key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </section>
  );
}
