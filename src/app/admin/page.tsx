import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import Link from 'next/link';

export const metadata = { title: 'Admin Dashboard' };

async function getCounts() {
  const [artists, projects, publications, newsItems, merchandise, subscribers, users] =
    await Promise.all([
      prisma.artist.count(),
      prisma.project.count(),
      prisma.publication.count(),
      prisma.newsItem.count(),
      prisma.merchandiseItem.count(),
      prisma.subscriber.count(),
      prisma.user.count(),
    ]);
  return { artists, projects, publications, newsItems, merchandise, subscribers, users };
}

export default async function AdminDashboard() {
  const counts = await getCounts();
  const recentLogs = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  });

  const stats = [
    { label: 'Artists', count: counts.artists, href: '/admin/artists' },
    { label: 'Projects', count: counts.projects, href: '/admin/projects' },
    { label: 'Publications', count: counts.publications, href: '/admin/publications' },
    { label: "What's Up", count: counts.newsItems, href: '/admin/news' },
    { label: 'Merchandise', count: counts.merchandise, href: '/admin/merchandise' },
    { label: 'Subscribers', count: counts.subscribers, href: '/admin/subscribers' },
    { label: 'Users', count: counts.users, href: '/admin/users' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border border-black p-4 hover:bg-black hover:text-white transition-colors group"
          >
            <div className="font-display font-black text-3xl leading-none mb-1">{s.count}</div>
            <div className="text-xs tracking-widest uppercase opacity-60 group-hover:opacity-100">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="font-body font-medium text-xs tracking-widest uppercase mb-4">
          Recent Activity
        </h2>
        {recentLogs.length === 0 ? (
          <p className="text-xs font-body opacity-40">No activity yet.</p>
        ) : (
          <table className="w-full text-xs font-body">
            <thead>
              <tr className="text-left border-b border-black">
                <th className="pb-2 font-medium tracking-widest uppercase opacity-60">Time</th>
                <th className="pb-2 font-medium tracking-widest uppercase opacity-60">User</th>
                <th className="pb-2 font-medium tracking-widest uppercase opacity-60">Action</th>
                <th className="pb-2 font-medium tracking-widest uppercase opacity-60">Entity</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-black/10">
                  <td className="py-2 opacity-40">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-2">{log.user?.email ?? '—'}</td>
                  <td className="py-2 uppercase">{log.action}</td>
                  <td className="py-2">
                    {log.entity}
                    {log.entityId ? ` #${log.entityId.slice(-6)}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
