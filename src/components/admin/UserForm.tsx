'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const RESOURCES = ['artists', 'projects', 'publications', 'news', 'merchandise', 'pages'] as const;
const ACTIONS = ['create', 'read', 'update', 'delete'] as const;

interface Permission { id: string; resource: string; actions: string[]; }
interface UserData {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  expiresAt: Date | null;
  permissions: Permission[];
}

export function UserForm({ user }: { user?: UserData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'EDITOR',
    expiresAt: user?.expiresAt ? new Date(user.expiresAt).toISOString().split('T')[0] : '',
  });

  const [perms, setPerms] = useState<Record<string, string[]>>(
    () => {
      const initial: Record<string, string[]> = {};
      for (const r of RESOURCES) initial[r] = [];
      if (user?.permissions) {
        for (const p of user.permissions) initial[p.resource] = p.actions;
      }
      return initial;
    }
  );

  const togglePerm = (resource: string, action: string) => {
    setPerms((prev) => {
      const current = prev[resource] ?? [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      expiresAt: form.expiresAt || null,
      permissions: RESOURCES.map((r) => ({ resource: r, actions: perms[r] })).filter((p) => p.actions.length > 0),
    };

    const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users';
    const method = user ? 'PUT' : 'POST';

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

    startTransition(() => router.push('/admin/users'));
    router.refresh();
  };

  const inputCls = 'w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none';
  const labelCls = 'block text-xs tracking-widest uppercase font-body font-medium mb-1';

  const showPermissions = form.role === 'EDITOR';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className={labelCls}>Email *</label>
        <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required disabled={!!user} />
      </div>

      <div>
        <label className={labelCls}>{user ? 'New Password (leave blank to keep)' : 'Password *'}</label>
        <input type="password" className={inputCls} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required={!user} />
      </div>

      <div>
        <label className={labelCls}>Role</label>
        <select className={`${inputCls} cursor-pointer`} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMIN">Admin</option>
          <option value="EDITOR">Editor</option>
          <option value="ARTIST">Artist</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Expiry Date (optional)</label>
        <input type="date" className={inputCls} value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
        <p className="text-xs font-body opacity-40 mt-1">Account auto-deactivates after this date.</p>
      </div>

      {showPermissions && (
        <div>
          <label className={labelCls + ' mb-4'}>Permissions</label>
          <div className="overflow-x-auto">
            <table className="text-xs font-body w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left pb-2 font-medium tracking-widest uppercase opacity-60 w-32">Resource</th>
                  {ACTIONS.map((a) => (
                    <th key={a} className="text-center pb-2 font-medium tracking-widest uppercase opacity-60 px-2">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((resource) => (
                  <tr key={resource} className="border-b border-black/10">
                    <td className="py-2 uppercase tracking-widest">{resource}</td>
                    {ACTIONS.map((action) => (
                      <td key={action} className="py-2 text-center">
                        <input
                          type="checkbox"
                          checked={perms[resource]?.includes(action) ?? false}
                          onChange={() => togglePerm(resource, action)}
                          className="w-3 h-3"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-body border border-black px-3 py-2">{error}</p>}

      <div className="flex gap-4">
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 disabled:opacity-50">
          {isPending ? 'Saving...' : user ? 'Save Changes' : 'Create User'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-black text-xs tracking-widest uppercase font-body hover:bg-black hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
