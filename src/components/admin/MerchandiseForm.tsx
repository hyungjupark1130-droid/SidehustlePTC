'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface MerchandiseData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: { toString(): string } | number | string;
  externalUrl: string | null;
  inStock: boolean;
}

export function MerchandiseForm({ item }: { item?: MerchandiseData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: item?.title ?? '',
    description: item?.description ?? '',
    price: item?.price !== undefined ? Number(item.price).toFixed(2) : '',
    externalUrl: item?.externalUrl ?? '',
    inStock: item?.inStock ?? true,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls =
    'w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none';
  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      price: form.price ? parseFloat(form.price) : 0,
    };

    const url = item ? `/api/admin/merchandise/${item.id}` : '/api/admin/merchandise';
    const method = item ? 'PUT' : 'POST';

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
    startTransition(() => router.push('/admin/merchandise'));
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
        <label className={labelCls}>Price (£) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className={inputCls}
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
          required
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

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="inStock"
          checked={form.inStock}
          onChange={(e) => set('inStock', e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="inStock" className="text-xs tracking-widest uppercase font-body font-medium">
          In Stock
        </label>
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
          {isPending ? 'Saving...' : item ? 'Save Changes' : 'Create Item'}
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
