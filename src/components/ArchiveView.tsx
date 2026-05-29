'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ArtistSummary } from '@/lib/types';
import { ArtistPreviewPanel } from '@/components/ArtistPreviewPanel';
import { useArchive } from '@/components/ArchiveProvider';

interface ArchiveViewProps {
  artists: ArtistSummary[];
}

function groupByLastName(artists: ArtistSummary[]): Record<string, ArtistSummary[]> {
  const groups: Record<string, ArtistSummary[]> = {};
  const sorted = [...artists].sort((a, b) => a.lastName.localeCompare(b.lastName));
  for (const artist of sorted) {
    const letter = artist.lastName[0]?.toUpperCase() ?? '#';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(artist);
  }
  return groups;
}

interface ArtistRowProps {
  artist: ArtistSummary;
  isSelected: boolean;
  onSelect: (artist: ArtistSummary) => void;
}

function ArtistRow({ artist, isSelected, onSelect }: ArtistRowProps) {
  const router = useRouter();
  const { closeArchive } = useArchive();
  const prefersReduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 1) {
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        onSelect(artist);
      }, 280);
    } else {
      clearTimeout(timerRef.current);
      clickCountRef.current = 0;
      closeArchive();
      router.push(`/archive/${artist.slug}`);
    }
  };

  const active = hovered || isSelected;

  return (
    <li>
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative text-left"
        style={{ transformOrigin: 'left center' }}
        aria-label={`${artist.firstName} ${artist.lastName} — single click to preview, double-click to open profile`}
      >
        <motion.span
          className="inline-block font-body font-light text-base leading-tight tracking-tight"
          animate={
            prefersReduced
              ? {}
              : active
              ? { scale: 2.2, fontWeight: 700 }
              : { scale: 1, fontWeight: 300 }
          }
          style={{ transformOrigin: 'left center', display: 'inline-block' }}
          transition={
            prefersReduced
              ? {}
              : { type: 'spring', stiffness: 350, damping: 28 }
          }
        >
          {artist.firstName} {artist.lastName}
        </motion.span>
      </button>
    </li>
  );
}

export function ArchiveView({ artists }: ArchiveViewProps) {
  const [selectedArtist, setSelectedArtist] = useState<ArtistSummary | null>(null);
  const groups = groupByLastName(artists);
  const letters = Object.keys(groups).sort();

  const handleSelect = (artist: ArtistSummary) => {
    setSelectedArtist((prev) => (prev?.id === artist.id ? null : artist));
  };

  if (artists.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center">
        <p className="font-body font-light text-sm tracking-widest uppercase">
          Archive coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Artist list — left side */}
      <div className="w-[30%] min-w-0">
        {letters.map((letter) => (
          <section key={letter} className="mb-16">
            <div
              aria-hidden="true"
              className="font-display font-black leading-none text-black select-none mb-4"
              style={{ fontSize: 'clamp(12vw, 16vw, 18vw)', lineHeight: 0.85 }}
            >
              {letter}
            </div>
            <ul className="space-y-0 pl-2 overflow-visible">
              {groups[letter].map((artist) => (
                <ArtistRow
                  key={artist.id}
                  artist={artist}
                  isSelected={selectedArtist?.id === artist.id}
                  onSelect={handleSelect}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Preview panel — fixed at the center of the viewport */}
      <div className="hidden md:block fixed top-36 left-[45%] -translate-x-1/2 w-[28rem] z-30">
        <ArtistPreviewPanel artist={selectedArtist} />
      </div>
    </div>
  );
}
