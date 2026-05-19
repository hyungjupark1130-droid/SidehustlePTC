import { ProjectForm } from '@/components/admin/ProjectForm';

export const dynamic = "force-dynamic";
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';

export const metadata = { title: 'New Project — Admin' };

export default async function NewProjectPage() {
  const { allowed } = await checkPermission('projects', 'create');
  if (!allowed) redirect('/admin/projects');
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">New Project</h1>
      <ProjectForm />
    </div>
  );
}
