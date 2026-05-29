'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PublicationData {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  publishedAt: Date | null;
  description: string | null;
  externalUrl: string | null;
  coverUrl: string | null;
  fontSize: string | null;
  lineHeight: string | null;
  textAlign: string | null;
}

function toDateInput(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export function PublicationForm({ publication }: { publication?: PublicationData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [coverUrl, setCoverUrl] = useState(publication?.coverUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: publication?.title ?? '',
    authors: publication?.authors.join(', ') ?? '',
    publishedAt: toDateInput(publication?.publishedAt),
    description: publication?.description ?? '',
    externalUrl: publication?.externalUrl ?? '',
    fontSize: publication?.fontSize ?? 'base',
    lineHeight: publication?.lineHeight ?? 'relaxed',
    textAlign: publication?.textAlign ?? 'left',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      setCoverUrl(data.url);
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

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
      coverUrl: coverUrl || null,
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

      <div>
        <label className={labelCls}>Typography</label>
        <div className="flex flex-col gap-3 mt-2">
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase opacity-40 mb-1.5">Font Size</p>
            <div className="flex gap-1 flex-wrap">
              {[['sm', 'Small'], ['base', 'Base'], ['lg', 'Large'], ['xl', 'X-Large']].map(([val, display]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('fontSize', val)}
                  className={`px-3 py-1 text-[10px] font-body tracking-widest uppercase border transition-colors ${
                    form.fontSize === val
                      ? 'bg-black text-white border-black'
                      : 'bg-transparent text-black border-black/30 hover:border-black'
                  }`}
                >
                  {display}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase opacity-40 mb-1.5">Line Height</p>
            <div className="flex gap-1 flex-wrap">
              {[['tight', 'Tight'], ['normal', 'Normal'], ['relaxed', 'Relaxed'], ['loose', 'Loose']].map(([val, display]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('lineHeight', val)}
                  className={`px-3 py-1 text-[10px] font-body tracking-widest uppercase border transition-colors ${
                    form.lineHeight === val
                      ? 'bg-black text-white border-black'
                      : 'bg-transparent text-black border-black/30 hover:border-black'
                  }`}
                >
                  {display}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase opacity-40 mb-1.5">Alignment</p>
            <div className="flex gap-1">
              {[['left', 'Left'], ['center', 'Center'], ['right', 'Right']].map(([val, display]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('textAlign', val)}
                  className={`px-3 py-1 text-[10px] font-body tracking-widest uppercase border transition-colors ${
                    form.textAlign === val
                      ? 'bg-black text-white border-black'
                      : 'bg-transparent text-black border-black/30 hover:border-black'
                  }`}
                >
                  {display}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Cover Image</label>
        {coverUrl && (
          <div className="mb-3 relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt="Cover preview"
              className="max-h-48 border border-black/10 object-cover"
            />
            <button
              type="button"
              onClick={() => { setCoverUrl(''); if (fileRef.current) fileRef.current.value = ''; }}
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
