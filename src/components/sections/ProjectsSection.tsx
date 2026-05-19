import Link from 'next/link';

interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: string;
  featured: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section
      id="projects"
      className="mx-6 md:mx-12 py-32 border-t border-black"
      aria-labelledby="projects-heading"
    >
      <h2
        id="projects-heading"
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        Projects
      </h2>

      {projects.length === 0 ? (
        <p className="font-body font-light text-sm tracking-widest uppercase">
          No projects featured yet.
        </p>
      ) : (
        <div className="space-y-0 divide-y divide-black">
          {projects.map((project, i) => (
            <article key={project.id} className="py-10 group">
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                <span className="font-body font-light text-xs tracking-widest uppercase shrink-0 w-8">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h3
                    className="font-display font-black leading-none mb-4"
                    style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {project.title}
                    </Link>
                  </h3>
                  {project.description && (
                    <p className="font-body font-light text-sm leading-relaxed max-w-2xl">
                      {project.description}
                    </p>
                  )}
                </div>
                <span className="font-body font-light text-xs tracking-widest uppercase shrink-0">
                  {project.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-16">
        <Link
          href="/projects"
          className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 hover:tracking-[0.25em] transition-all duration-300"
        >
          All Projects →
        </Link>
      </div>
    </section>
  );
}
