'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useArchive } from '@/components/ArchiveProvider';
import { ArchiveOverlay } from '@/components/ArchiveOverlay';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { label: "What's Up", href: '/#whats-up', id: 'whats-up' },
  { label: 'Projects', href: '/#projects', id: 'projects' },
  { label: 'Archive', href: '/archive', id: 'archive' },
  { label: 'About', href: '/#about', id: 'about' },
  { label: 'Publications', href: '/#publications', id: 'publications' },
  { label: 'Merchandise', href: '/#merchandise', id: 'merchandise' },
  { label: 'Contact', href: '/#contact', id: 'contact' },
];

export function Navigation() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { openArchive, isOpen } = useArchive();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isHome) {
      const played = sessionStorage.getItem('sh-intro-played');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (played || prefersReduced) {
        setVisible(true);
      } else {
        const t = setTimeout(() => setVisible(true), 950);
        return () => clearTimeout(t);
      }
    } else {
      setVisible(true);
    }
  }, [isHome]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof NAV_ITEMS)[0]
  ) => {
    setMenuOpen(false);
    if (item.id === 'archive') {
      e.preventDefault();
      openArchive();
      return;
    }
    if (!isHome && item.href.startsWith('/#')) {
      return;
    }
    if (isHome && item.href.startsWith('/#')) {
      e.preventDefault();
      const el = document.getElementById(item.id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop nav */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 right-0 z-40 hidden md:flex items-center pr-12"
        style={{ height: '3.25rem' }}
        aria-label="Main navigation"
      >
        <ul className="flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.id === 'archive' && isOpen);
            return (
              <li key={item.id}>
                <Link
                  href={isHome ? item.href : item.href.startsWith('/#') ? `/${item.href.slice(1)}` : item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={[
                    'font-body text-xs tracking-widest uppercase transition-all duration-200',
                    'hover:tracking-[0.2em]',
                    isActive ? 'underline underline-offset-4 font-medium' : 'font-light',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.nav>

      {/* Mobile hamburger button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => setMenuOpen((o) => !o)}
        className="fixed top-0 right-0 z-50 md:hidden flex items-center justify-center pr-6"
        style={{ height: '3.25rem', width: '3.25rem' }}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span className="flex flex-col gap-[5px]">
          <span
            className="block h-px w-5 bg-current transition-all duration-300 origin-center"
            style={menuOpen ? { transform: 'translateY(6px) rotate(45deg)', backgroundColor: 'white' } : {}}
          />
          <span
            className="block h-px w-5 bg-current transition-all duration-300"
            style={menuOpen ? { opacity: 0, backgroundColor: 'white' } : {}}
          />
          <span
            className="block h-px w-5 bg-current transition-all duration-300 origin-center"
            style={menuOpen ? { transform: 'translateY(-6px) rotate(-45deg)', backgroundColor: 'white' } : {}}
          />
        </span>
      </motion.button>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black text-white flex flex-col justify-center px-10 md:hidden"
          >
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col gap-6">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = pathname === item.href || (item.id === 'archive' && isOpen);
                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Link
                        href={isHome ? item.href : item.href.startsWith('/#') ? `/${item.href.slice(1)}` : item.href}
                        onClick={(e) => handleNavClick(e, item)}
                        className={[
                          'font-display font-black text-3xl leading-none transition-opacity duration-200',
                          'hover:opacity-60',
                          isActive ? 'underline underline-offset-8' : '',
                        ].join(' ')}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <ArchiveOverlay />
    </>
  );
}
