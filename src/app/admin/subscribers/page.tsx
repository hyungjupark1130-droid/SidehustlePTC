import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function syncFromMailchimp() {
  'use server';
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const server = process.env.MAILCHIMP_API_SERVER ?? 'us1';
  if (!apiKey || !audienceId) return;

  const url = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members?count=1000&status=subscribed`;
  const res = await fetch(url, {
    headers: { Authorization: `apikey ${apiKey}` },
  });
  if (!res.ok) return;

  const data = await res.json();
  const members = data.members ?? [];

  for (const member of members) {
    await prisma.subscriber.upsert({
      where: { email: member.email_address },
      update: {
        mailchimpId: member.id,
        firstName: member.merge_fields?.FNAME || null,
        lastName: member.merge_fields?.LNAME || null,
        syncedAt: new Date(),
      },
      create: {
        email: member.email_address,
        mailchimpId: member.id,
        firstName: member.merge_fields?.FNAME || null,
        lastName: member.merge_fields?.LNAME || null,
        syncedAt: new Date(),
      },
    });
  }

  revalidatePath('/admin/subscribers');
}

export default async function AdminSubscribersPage() {
  const { allowed, role } = await checkPermission('users', 'read');
  if (!allowed || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) redirect('/admin');

  const subscribers = await prisma.subscriber.findMany({ orderBy: { email: 'asc' } });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl leading-none">Subscribers</h1>
        <form action={syncFromMailchimp}>
          <button type="submit" className="px-4 py-2 border border-black text-xs tracking-widest uppercase font-body hover:bg-black hover:text-white transition-colors">
            Sync from Mailchimp
          </button>
        </form>
      </div>

      <p className="text-xs font-body opacity-40 mb-6">{subscribers.length} subscribers</p>

      <table className="w-full text-sm font-body">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Email</th>
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Name</th>
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Synced</th>
            <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Mailchimp</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr key={sub.id} className="border-b border-black/10">
              <td className="py-3">{sub.email}</td>
              <td className="py-3 opacity-60">{[sub.firstName, sub.lastName].filter(Boolean).join(' ') || '—'}</td>
              <td className="py-3 opacity-60 text-xs">{sub.syncedAt ? new Date(sub.syncedAt).toLocaleDateString('en-GB') : <span className="opacity-40">Pending</span>}</td>
              <td className="py-3 text-xs opacity-40">{sub.mailchimpId ? '✓' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
