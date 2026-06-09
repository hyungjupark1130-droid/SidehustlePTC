import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const metadata = { title: 'Projects' };
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { startDate: 'desc' } });

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 text-center">
      <h1
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        Projects
      </h1>

      {projects.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">No projects yet.</p>
      ) : (
        <div className="divide-y divide-black">
          {projects.map((project, i) => (
            <article key={project.id} className="py-10">
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                <span className="font-body font-light text-xs tracking-widest uppercase shrink-0 w-8 opacity-40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h2
                    className="font-display font-black leading-none mb-4"
                    style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}
                  >
                    <Link href={`/projects/${project.slug}`} className="hover:underline underline-offset-4">
                      {project.title}
                    </Link>
                  </h2>
                  {project.description && (
                    <p className="font-body font-light text-sm leading-relaxed max-w-2xl">{project.description}</p>
                  )}
                </div>
                <span className="font-body font-light text-xs tracking-widest uppercase shrink-0 opacity-40">
                  {project.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
