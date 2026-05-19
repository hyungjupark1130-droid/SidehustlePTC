'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface PageData {
  id: string;
  slug: string;
  title: string;
  body: string;
}

export function PageForm({ page }: { page: PageData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [body, setBody] = useState(page.body);

  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Save failed.');
      return;
    }
    startTransition(() => router.push('/admin/pages'));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className={labelCls}>Title</label>
        <p className="text-sm font-body py-2 opacity-60">{page.title}</p>
      </div>

      <div>
        <label className={labelCls}>Slug</label>
        <p className="text-sm font-body py-2 opacity-60">/{page.slug}</p>
      </div>

      <div>
        <label className={labelCls}>Body *</label>
        <textarea
          className="w-full border border-black py-2 px-3 text-sm font-body bg-transparent focus:outline-none resize-y min-h-[300px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
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
          {isPending ? 'Saving...' : 'Save Changes'}
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
