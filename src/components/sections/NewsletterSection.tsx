'use client';

import { useState } from 'react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <section
      id="newsletter"
      className="mx-6 md:mx-12 py-32 border-t border-black"
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-xl">
        <h2
          id="newsletter-heading"
          className="font-display font-black text-black leading-none mb-6"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
        >
          Newsletter
        </h2>
        <p className="font-body font-light text-base mb-8">
          Subscribe to receive occasional updates on projects, publications, and the archive.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="flex-1 border-b border-black py-2 font-body text-base bg-transparent focus:outline-none placeholder:text-black/30"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="shrink-0 font-body font-light text-xs tracking-widest uppercase hover:tracking-[0.2em] transition-all duration-300 disabled:opacity-50 sm:self-end pb-2"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 font-body text-sm ${
              status === 'error' ? 'text-red-500' : 'text-black'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
