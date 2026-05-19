import Image from 'next/image';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'About' };
export const dynamic = 'force-dynamic';

const TEAM = [
  {
    name: 'Lance Chan',
    photo: '/uploads/team/lance-chan.png',
    bio: 'Lance is very outgoing and creative. He works with Mai 36 Galerie across fair support, curatorial, and research-based projects, and has experience with Art Basel HK, Art Basel Basel, and Frieze London, alongside developing independent curatorial and archival initiatives. Lance leads writing, exhibitions, artwork sales, and merchandise & editions design.',
  },
  {
    name: 'Yanru',
    photo: '/uploads/team/yanru.png',
    bio: 'Yanru is empathetic and responsible, and has dyslexia. She has a lot of entrepreneurial experience and has worked as an independent curator since 2022. Yanru leads writing, exhibitions, and events production — and is the person mainly responsible for task and timeline management.',
  },
  {
    name: 'Hao Zhang',
    photo: '/uploads/team/hao-zhang.png',
    bio: 'Hao is a super experienced and down-to-earth project manager who has collaborated with POPMART and many BJD artists. She worked in the internet industry and now works for an AI startup. Hao leads artwork sales, merchandise & editions manufacturing, and events production in Mainland China. She holds a bachelor and master degree in History of Art and previously worked at ARTIO!',
  },
  {
    name: 'Hyungju Park',
    photo: '/uploads/team/hyungju-park.png',
    bio: 'Hyungju is a chill guy who works as a music producer and musician manager. He composes jazz, classical, soul, R&B, and pop music. He leads business development and events production in the UK.',
  },
];

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'about' } });
  const body = page?.body ?? '';
  const paragraphs = body.split('\n\n').filter(Boolean);

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
      <h1
        className="font-display font-black text-black leading-none mb-16"
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
      >
        About
      </h1>

      {/* Organisation description */}
      {paragraphs.length > 0 && (
        <div className="max-w-2xl font-body font-light text-base leading-relaxed space-y-6 mb-24">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {/* Team section */}
      <div className="border-t border-black pt-16 mb-8">
        <h2
          className="font-display font-black text-black leading-none mb-16"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          Meet Our Team
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:gap-16 max-w-3xl">
          {TEAM.map((member) => (
            <div key={member.name} className="flex gap-5 items-start">
              <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-full bg-black/5">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div>
                <p className="font-display font-black text-sm mb-2">{member.name}</p>
                <p className="font-body font-light text-xs leading-relaxed opacity-70">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
