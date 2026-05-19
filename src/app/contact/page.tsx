import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Contact' };
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'contact' } });

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="px-6 md:px-12">
        <h1
          className="font-display font-black text-black leading-none mb-16"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
        >
          Contact
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl">
          <div>
            {page?.body ? (
              <div className="font-body font-light text-base leading-relaxed space-y-4">
                {page.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <address className="font-body font-light text-base not-italic leading-relaxed">
                Side Hustle<br />
                London, United Kingdom
              </address>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-body font-light text-xs tracking-widest uppercase mb-2 opacity-50">General Enquiries</h2>
              <a href="mailto:info@sidehustle.art" className="font-body font-light text-lg hover:underline underline-offset-4">
                info@sidehustle.art
              </a>
            </div>
            <div>
              <h2 className="font-body font-light text-xs tracking-widest uppercase mb-2 opacity-50">Social</h2>
              <ul className="flex flex-col gap-1">
                <li><a href="https://instagram.com/sidehustle" target="_blank" rel="noopener noreferrer" className="font-body font-light text-lg hover:underline underline-offset-4">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
