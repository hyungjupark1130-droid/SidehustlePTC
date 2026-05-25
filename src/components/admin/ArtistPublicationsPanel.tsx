'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Publication {
  id: string;
  title: string;
  publishedAt: Date | string | null;
}

interface Props {
  artistId: string;
  linked: Publication[];
  available: Publication[];
}

export function ArtistPublicationsPanel({ artistId, linked, available }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLink = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/artists/${artistId}/publications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationId: selectedId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Failed to link.');
        return;
      }
      setSelectedId('');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (pubId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/admin/artists/${artistId}/publications?publicationId=${pubId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Failed to unlink.');
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  return (
    <div className="mt-12 pt-10 border-t border-black/20">
      <h2 className="font-display font-black text-xl leading-none mb-6">Articles &amp; Publications</h2>

      {linked.length === 0 ? (
        <p className="text-xs font-body opacity-40 mb-6">No publications linked yet.</p>
      ) : (
        <ul className="flex flex-col gap-2 mb-6">
          {linked.map((pub) => (
            <li key={pub.id} className="flex items-center justify-between border-b border-black/10 pb-2">
              <div>
                <Link
                  href={`/admin/publications/${pub.id}`}
                  className="font-body text-sm hover:underline underline-offset-2"
                >
                  {pub.title}
                </Link>
                {pub.publishedAt && (
                  <span className="font-body font-light text-xs opacity-40 ml-3">
                    {new Date(pub.publishedAt).getFullYear()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleUnlink(pub.id)}
                disabled={loading}
                className="text-xs font-body uppercase tracking-widest hover:underline opacity-40 hover:opacity-100 transition-opacity disabled:opacity-20"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 && (
        <div>
          <label className={labelCls}>Link a publication</label>
          <div className="flex gap-3 items-end">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none"
            >
              <option value="">— Select —</option>
              {available.map((pub) => (
                <option key={pub.id} value={pub.id}>
                  {pub.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleLink}
              disabled={!selectedId || loading}
              className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              Link
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link
          href="/admin/publications/new"
          className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 opacity-40 hover:opacity-100 transition-opacity"
        >
          + Create new publication
        </Link>
      </div>

      {error && (
        <p className="text-xs font-body border border-black px-3 py-2 mt-3">{error}</p>
      )}
    </div>
  );
}
