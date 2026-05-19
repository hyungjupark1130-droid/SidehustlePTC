'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ArtistImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

interface ArtistData {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  birthYear: number | null;
  deathYear: number | null;
  nationality: string | null;
  featured: boolean;
  images: ArtistImage[];
}

export function ArtistForm({ artist }: { artist?: ArtistData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: artist?.firstName ?? '',
    lastName: artist?.lastName ?? '',
    bio: artist?.bio ?? '',
    birthYear: artist?.birthYear?.toString() ?? '',
    deathYear: artist?.deathYear?.toString() ?? '',
    nationality: artist?.nationality ?? '',
    featured: artist?.featured ?? false,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      birthYear: form.birthYear ? parseInt(form.birthYear) : null,
      deathYear: form.deathYear ? parseInt(form.deathYear) : null,
    };

    const url = artist ? `/api/admin/artists/${artist.id}` : '/api/admin/artists';
    const method = artist ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Save failed.');
      return;
    }

    startTransition(() => router.push('/admin/artists'));
    router.refresh();
  };

  const inputCls =
    'w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none';
  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>First Name</label>
          <input
            className={inputCls}
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Last Name *</label>
          <input
            className={inputCls}
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Nationality</label>
        <input
          className={inputCls}
          value={form.nationality}
          onChange={(e) => set('nationality', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Birth Year</label>
          <input
            className={inputCls}
            type="number"
            value={form.birthYear}
            onChange={(e) => set('birthYear', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Death Year</label>
          <input
            className={inputCls}
            type="number"
            value={form.deathYear}
            onChange={(e) => set('deathYear', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Bio</label>
        <textarea
          className="w-full border border-black py-2 px-3 text-sm font-body bg-transparent focus:outline-none resize-y min-h-[160px]"
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          checked={form.featured}
          onChange={(e) => set('featured', e.target.checked)}
          className="w-4 h-4"
        />
        <label
          htmlFor="featured"
          className="text-xs tracking-widest uppercase font-body font-medium"
        >
          Featured in archive preview
        </label>
      </div>

      {error && (
        <p className="text-xs font-body border border-black px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : artist ? 'Save Changes' : 'Create Artist'}
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
