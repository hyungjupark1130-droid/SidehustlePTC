'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  body: string;
  publishedAt: Date;
  image: string | null;
}

export function NewsForm({ item }: { item?: NewsItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(item?.image ?? '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: item?.title ?? '',
    body: item?.body ?? '',
    publishedAt: item?.publishedAt
      ? new Date(item.publishedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls =
    'w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none';
  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Upload failed.'); return; }
      setImageUrl(data.url);
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const url = item ? `/api/admin/news/${item.id}` : '/api/admin/news';
    const method = item ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, image: imageUrl || null }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Save failed.');
      return;
    }
    startTransition(() => router.push('/admin/news'));
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
        <label className={labelCls}>Published Date</label>
        <input
          type="date"
          className={inputCls}
          value={form.publishedAt}
          onChange={(e) => set('publishedAt', e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Body *</label>
        <textarea
          className="w-full border border-black py-2 px-3 text-sm font-body bg-transparent focus:outline-none resize-y min-h-[200px]"
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls}>Image</label>
        {imageUrl && (
          <div className="mb-3 relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Preview"
              className="max-h-48 border border-black/10 object-cover"
            />
            <button
              type="button"
              onClick={() => { setImageUrl(''); if (fileRef.current) fileRef.current.value = ''; }}
              className="absolute top-1 right-1 bg-black text-white text-xs px-1.5 py-0.5 hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
          onChange={handleFileChange}
          disabled={uploading}
          className="block text-xs font-body text-black/60 file:mr-3 file:py-1.5 file:px-3 file:border file:border-black file:text-xs file:uppercase file:tracking-widest file:bg-transparent file:cursor-pointer hover:file:bg-black hover:file:text-white file:transition-colors"
        />
        {uploading && <p className="text-xs font-body opacity-40 mt-1">Uploading…</p>}
      </div>

      {error && (
        <p className="text-xs font-body border border-black px-3 py-2">{error}</p>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : item ? 'Save' : 'Create'}
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
