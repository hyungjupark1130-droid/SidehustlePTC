'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '@/components/ArchiveProvider';
import { ArchiveView } from '@/components/ArchiveView';
import type { ArtistSummary } from '@/lib/types';

export function ArchiveOverlay() {
  const { isOpen, closeArchive } = useArchive();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [artists, setArtists] = useState<ArtistSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch artists on first open
  useEffect(() => {
    if (!isOpen || loaded) return;
    fetch('/api/archive/artists')
      .then((r) => r.json())
      .then((data) => {
        setArtists(data);
        setLoaded(true);
      })
      .catch(console.error);
  }, [isOpen, loaded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeArchive();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeArchive]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          key="archive-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Artist Archive"
          onKeyDown={handleKeyDown}
        >
          <button
            ref={closeButtonRef}
            onClick={closeArchive}
            className="fixed top-6 right-6 z-[110] text-xs tracking-widest uppercase font-body font-light hover:font-medium transition-all duration-200"
            aria-label="Close archive"
          >
            Close ×
          </button>

          <div className="pt-24 pb-32 px-6 md:px-12">
            {!loaded ? (
              <p className="font-body font-light text-xs tracking-widest uppercase">
                Loading...
              </p>
            ) : (
              <ArchiveView artists={artists} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
