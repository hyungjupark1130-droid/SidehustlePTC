import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import Link from 'next/link';
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { writeAudit } from '@/lib/admin/audit';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const metadata = { title: 'Artists — Admin' };

async function deleteArtist(formData: FormData) {
  'use server';
  const { allowed, userId } = await checkPermission('artists', 'delete');
  if (!allowed) return;
  const id = formData.get('id') as string;
  await prisma.artist.delete({ where: { id } });
  await writeAudit({ userId, action: 'delete', entity: 'artist', entityId: id });
  revalidatePath('/admin/artists');
}

export default async function AdminArtistsPage() {
  const { allowed } = await checkPermission('artists', 'read');
  if (!allowed) redirect('/admin');

  const artists = await prisma.artist.findMany({ orderBy: { lastName: 'asc' } });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl leading-none">Artists</h1>
        <Link
          href="/admin/artists/new"
          className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors"
        >
          + New Artist
        </Link>
      </div>

      {artists.length === 0 ? (
        <p className="text-xs font-body opacity-40">No artists yet.</p>
      ) : (
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-black">
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">Name</th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Nationality
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Featured
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.id} className="border-b border-black/10">
                <td className="py-3">
                  <Link
                    href={`/admin/artists/${artist.id}`}
                    className="hover:underline underline-offset-2"
                  >
                    {artist.firstName} {artist.lastName}
                  </Link>
                </td>
                <td className="py-3 opacity-60">{artist.nationality ?? '—'}</td>
                <td className="py-3">{artist.featured ? '✓' : '—'}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/artists/${artist.id}`}
                      className="text-xs uppercase tracking-widest hover:underline underline-offset-2"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={artist.id} action={deleteArtist} confirmMessage="Delete this artist?" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
