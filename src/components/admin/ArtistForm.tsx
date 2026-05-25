'use client';

import { useState, useTransition, useRef } from 'react';
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

  const [images, setImages] = useState<ArtistImage[]>(artist?.images ?? []);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!artist?.id) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setImageError(uploadData.error ?? 'Upload failed.');
        return;
      }
      const addRes = await fetch(`/api/admin/artists/${artist.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadData.url, alt: '', order: images.length }),
      });
      const newImage = await addRes.json();
      if (!addRes.ok) {
        setImageError(newImage.error ?? 'Failed to save image.');
        return;
      }
      setImages((prev) => [...prev, newImage]);
    } catch {
      setImageError('Upload failed.');
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!artist?.id) return;
    const res = await fetch(`/api/admin/artists/${artist.id}/images/${imageId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    }
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
        <label className={labelCls}>Based In</label>
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

      {/* Image upload — only available when editing an existing artist */}
      {artist?.id && (
        <div>
          <label className={labelCls}>Photos</label>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt || 'Artist photo'}
                    className="w-full aspect-square object-cover border border-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute top-1 right-1 bg-black text-white text-xs px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            onChange={handleImageUpload}
            disabled={imageUploading}
            className="block text-xs font-body text-black/60 file:mr-3 file:py-1.5 file:px-3 file:border file:border-black file:text-xs file:uppercase file:tracking-widest file:bg-transparent file:cursor-pointer hover:file:bg-black hover:file:text-white file:transition-colors"
          />
          {imageUploading && (
            <p className="text-xs font-body opacity-40 mt-1">Uploading…</p>
          )}
          {imageError && (
            <p className="text-xs font-body border border-black px-3 py-2 mt-2">{imageError}</p>
          )}
        </div>
      )}

      {!artist?.id && (
        <p className="text-xs font-body opacity-40 border border-black/20 px-3 py-2">
          Save the artist first, then you can upload photos.
        </p>
      )}

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
