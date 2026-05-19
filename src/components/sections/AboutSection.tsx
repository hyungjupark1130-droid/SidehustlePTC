import Link from 'next/link';

interface AboutSectionProps {
  body: string | null;
}

export function AboutSection({ body }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="mx-6 md:mx-12 py-32 border-t border-black"
      aria-labelledby="about-heading"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <h2
          id="about-heading"
          className="font-display font-black text-black leading-none"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          About
        </h2>
        <div>
          {body ? (
            <div className="font-body font-light text-base leading-relaxed space-y-4 mb-8">
              {body.split('\n\n').slice(0, 2).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="font-body font-light text-base leading-relaxed mb-8">
              Side Hustle is a research-based artist organization.
            </p>
          )}
          <Link
            href="/about"
            className="font-body font-light text-xs tracking-widest uppercase underline underline-offset-4 hover:tracking-[0.25em] transition-all duration-300"
          >
            Full About →
          </Link>
        </div>
      </div>
    </section>
  );
}
