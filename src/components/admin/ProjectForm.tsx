'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ProjectData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  featured: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

function toDateInput(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

export function ProjectForm({ project }: { project?: ProjectData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: project?.title ?? '',
    description: project?.description ?? '',
    status: project?.status ?? 'active',
    featured: project?.featured ?? false,
    startDate: toDateInput(project?.startDate),
    endDate: toDateInput(project?.endDate),
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls =
    'w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none';
  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const url = project ? `/api/admin/projects/${project.id}` : '/api/admin/projects';
    const method = project ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Save failed.');
      return;
    }
    startTransition(() => router.push('/admin/projects'));
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
        <label className={labelCls}>Status</label>
        <select
          className="w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none"
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Start Date</label>
          <input
            type="date"
            className={inputCls}
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>End Date</label>
          <input
            type="date"
            className={inputCls}
            value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)}
          />
        </div>
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
          id="featured"
          checked={form.featured}
          onChange={(e) => set('featured', e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="featured" className="text-xs tracking-widest uppercase font-body font-medium">
          Featured
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
          {isPending ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
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
