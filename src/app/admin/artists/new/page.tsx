import { ArtistForm } from '@/components/admin/ArtistForm';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export const metadata = { title: 'New Artist — Admin' };

export default async function NewArtistPage() {
  const { allowed } = await checkPermission('artists', 'create');
  if (!allowed) redirect('/admin/artists');
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">New Artist</h1>
      <ArtistForm />
    </div>
  );
}
