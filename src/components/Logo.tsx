'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOGO_SIZE = '1.25rem';

export function Logo() {
  const pathname = usePathname();

  // Hide on admin pages — admin has its own header
  if (pathname.startsWith('/admin')) return null;

  return <LogoInner />;
}

function LogoInner() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    if (!mq.matches) sessionStorage.setItem('sh-intro-played', '1');
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1.5rem',
        display: 'flex',
        gap: '0.4em',
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: LOGO_SIZE,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        zIndex: 40,
      }}
    >
      <Link href="/" aria-label="Side Hustle home" style={{ display: 'flex', gap: '0.4em' }}>
        <motion.span
          initial={prefersReduced ? false : { x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          side
</motion.span>
        <motion.span
          initial={prefersReduced ? false : { x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          hustle
        </motion.span>
      </Link>
    </div>
  );
}
