import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export default async function AuditLogPage({ searchParams }: { searchParams: { page?: string } }) {
  const { allowed, role } = await checkPermission('users', 'read');
  if (!allowed || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) redirect('/admin');

  const page = Math.max(1, parseInt(searchParams.page ?? '1'));
  const take = 50;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / take);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">Audit Log</h1>

      <table className="w-full text-xs font-body">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="pb-3 font-medium tracking-widest uppercase opacity-60">Time</th>
            <th className="pb-3 font-medium tracking-widest uppercase opacity-60">User</th>
            <th className="pb-3 font-medium tracking-widest uppercase opacity-60">Action</th>
            <th className="pb-3 font-medium tracking-widest uppercase opacity-60">Entity</th>
            <th className="pb-3 font-medium tracking-widest uppercase opacity-60">ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-black/10">
              <td className="py-2 opacity-40 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('en-GB')}</td>
              <td className="py-2">{log.user?.email ?? <span className="opacity-40">system</span>}</td>
              <td className="py-2 uppercase">{log.action}</td>
              <td className="py-2">{log.entity}</td>
              <td className="py-2 opacity-40 font-mono">{log.entityId?.slice(-8) ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center gap-4 mt-8 text-xs font-body">
          {page > 1 && <a href={`?page=${page - 1}`} className="hover:underline underline-offset-2">← Previous</a>}
          <span className="opacity-40">Page {page} of {totalPages}</span>
          {page < totalPages && <a href={`?page=${page + 1}`} className="hover:underline underline-offset-2">Next →</a>}
        </div>
      )}
    </div>
  );
}
