'use client';
import { useReducedMotion, motion } from 'framer-motion';

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Intentionally sparse — the logo animation IS the hero */}
      <motion.p
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
        className="text-xs tracking-[0.3em] uppercase font-body font-light text-center"
      >
        Research-Based Artist Organization
      </motion.p>
    </section>
  );
}
