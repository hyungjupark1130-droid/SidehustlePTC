import { auth } from '@/lib/auth';

export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/artists', label: 'Artists' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/news', label: "What's Up" },
  { href: '/admin/publications', label: 'Publications' },
  { href: '/admin/merchandise', label: 'Merchandise' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/subscribers', label: 'Subscribers' },
  { href: '/admin/audit-log', label: 'Audit Log' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // No session — render children directly so /admin/login can display without a redirect loop.
  // The middleware already redirects other /admin/* pages to /admin/login when unauthenticated.
  if (!session?.user) {
    return <>{children}</>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { isActive: true, expiresAt: true, role: true },
  });
  if (!user?.isActive) redirect('/admin/login?error=inactive');
  if (user.expiresAt && user.expiresAt < new Date()) redirect('/admin/login?error=expired');

  return (
    <div className="min-h-screen bg-white font-body">
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/admin" className="font-display font-black text-sm tracking-tight">
            SIDE HUSTLE / Admin
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <span className="opacity-40">{session.user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="hover:underline underline-offset-2">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <nav className="w-48 border-r border-black shrink-0 py-8 px-4" aria-label="Admin navigation">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block text-xs tracking-widest uppercase py-1.5 px-2 hover:bg-black hover:text-white transition-colors rounded-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
