import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import { ProjectForm } from '@/components/admin/ProjectForm';
import { checkPermission } from '@/lib/admin/permissions';
import { notFound, redirect } from 'next/navigation';

export const metadata = { title: 'Edit Project — Admin' };

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const { allowed } = await checkPermission('projects', 'update');
  if (!allowed) redirect('/admin/projects');

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-display font-black text-3xl leading-none mb-8">{project.title}</h1>
      <ProjectForm project={project} />
    </div>
  );
}
