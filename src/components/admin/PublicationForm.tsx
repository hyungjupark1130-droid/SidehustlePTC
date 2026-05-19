'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface PublicationData {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  publishedAt: Date | null;
  description: string | null;
  externalUrl: string | null;
}

function toDateInput(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export function PublicationForm({ publication }: { publication?: PublicationData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: publication?.title ?? '',
    authors: publication?.authors.join(', ') ?? '',
    publishedAt: toDateInput(publication?.publishedAt),
    description: publication?.description ?? '',
    externalUrl: publication?.externalUrl ?? '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls =
    'w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none';
  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      authors: form.authors
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
    };

    const url = publication
      ? `/api/admin/publications/${publication.id}`
      : '/api/admin/publications';
    const method = publication ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Save failed.');
      return;
    }
    startTransition(() => router.push('/admin/publications'));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className={labelCls}>Title *</label>
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls}>Authors (comma-separated)</label>
        <input
          className={inputCls}
          value={form.authors}
          onChange={(e) => set('authors', e.target.value)}
          placeholder="Jane Doe, John Smith"
        />
      </div>

      <div>
        <label className={labelCls}>Published Date</label>
        <input
          type="date"
          className={inputCls}
          value={form.publishedAt}
          onChange={(e) => set('publishedAt', e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>External URL</label>
        <input
          type="url"
          className={inputCls}
          value={form.externalUrl}
          onChange={(e) => set('externalUrl', e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className="w-full border border-black py-2 px-3 text-sm font-body bg-transparent focus:outline-none resize-y min-h-[160px]"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      {error && (
        <p className="text-xs font-body border border-black px-3 py-2">{error}</p>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : publication ? 'Save Changes' : 'Create Publication'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-black text-xs tracking-widest uppercase font-body hover:bg-black hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
