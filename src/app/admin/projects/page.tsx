import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";
import Link from 'next/link';
import { checkPermission } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { writeAudit } from '@/lib/admin/audit';
import { DeleteButton } from '@/components/admin/DeleteButton';

export const metadata = { title: 'Projects — Admin' };

async function deleteProject(formData: FormData) {
  'use server';
  const { allowed, userId } = await checkPermission('projects', 'delete');
  if (!allowed) return;
  const id = formData.get('id') as string;
  await prisma.project.delete({ where: { id } });
  await writeAudit({ userId, action: 'delete', entity: 'project', entityId: id });
  revalidatePath('/admin/projects');
}

export default async function AdminProjectsPage() {
  const { allowed } = await checkPermission('projects', 'read');
  if (!allowed) redirect('/admin');

  const projects = await prisma.project.findMany({ orderBy: { title: 'asc' } });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-black text-3xl leading-none">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-xs font-body opacity-40">No projects yet.</p>
      ) : (
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left border-b border-black">
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Title
              </th>
              <th className="pb-3 text-xs tracking-widest uppercase font-medium opacity-60">
                Status
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
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-black/10">
                <td className="py-3">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="hover:underline underline-offset-2"
                  >
                    {project.title}
                  </Link>
                </td>
                <td className="py-3 opacity-60 uppercase text-xs">{project.status}</td>
                <td className="py-3">{project.featured ? '✓' : '—'}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs uppercase tracking-widest hover:underline underline-offset-2"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={project.id} action={deleteProject} confirmMessage="Delete this project?" />
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
