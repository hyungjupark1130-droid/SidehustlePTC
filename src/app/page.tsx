import { prisma } from '@/lib/prisma';
import { getImageUrl } from '@/lib/getImageUrl';
import { HeroSection } from '@/components/sections/HeroSection';
import { WhatsUpSection } from '@/components/sections/WhatsUpSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ArchivePreviewSection } from '@/components/sections/ArchivePreviewSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { PublicationsSection } from '@/components/sections/PublicationsSection';
import { MerchandiseSection } from '@/components/sections/MerchandiseSection';
import { NewsletterSection } from '@/components/sections/NewsletterSection';
import { ContactSection } from '@/components/sections/ContactSection';

export const metadata = {
  title: 'Side Hustle — Research-Based Artist Organization',
  description:
    'Side Hustle is a research-based artist organization dedicated to archiving and presenting contemporary artistic practice.',
};

export const dynamic = 'force-dynamic';

async function getHomeData() {
  const [newsItems, projects, featuredArtists, publications, merchandise, aboutPage] =
    await Promise.all([
      prisma.newsItem.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 4,
      }),
      prisma.project.findMany({
        where: { featured: true },
        take: 3,
      }),
      prisma.artist.findMany({
        where: { featured: true },
        take: 8,
        select: {
          id: true, slug: true, firstName: true, lastName: true,
          nationality: true, featured: true,
          images: { take: 1, orderBy: { order: 'asc' } },
        },
        orderBy: { lastName: 'asc' },
      }),
      prisma.publication.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 4,
      }),
      prisma.merchandiseItem.findMany({
        where: { inStock: true },
        take: 4,
      }),
      prisma.page.findUnique({ where: { slug: 'about' } }),
    ]);

  return { newsItems, projects, featuredArtists, publications, merchandise, aboutPage };
}

export default async function HomePage() {
  const { newsItems, projects, featuredArtists, publications, merchandise, aboutPage } =
    await getHomeData();

  return (
    <main>
      <HeroSection />

      <WhatsUpSection
        items={newsItems.map((n) => ({
          ...n,
          image: n.image ? getImageUrl(n.image) : null,
          publishedAt: n.publishedAt,
        }))}
      />

      <ProjectsSection
        projects={projects.map((p) => ({
          ...p,
          description: p.description ?? null,
          startDate: p.startDate ?? null,
          endDate: p.endDate ?? null,
        }))}
      />

      <ArchivePreviewSection
        artists={featuredArtists.map((a) => ({
          id: a.id,
          slug: a.slug,
          firstName: a.firstName,
          lastName: a.lastName,
          nationality: a.nationality,
          featured: a.featured,
          imageUrl: getImageUrl(a.images[0]?.url),
          imageAlt: a.images[0]?.alt ?? `${a.firstName} ${a.lastName}`,
        }))}
      />

      <AboutSection body={aboutPage?.body ?? null} />

      <PublicationsSection
        publications={publications.map((p) => ({
          ...p,
          publishedAt: p.publishedAt ?? null,
          coverUrl: p.coverUrl ? getImageUrl(p.coverUrl) : null,
          description: p.description ?? null,
          externalUrl: p.externalUrl || null,
        }))}
      />

      <MerchandiseSection
        items={merchandise.map((m) => ({
          ...m,
          price: m.price.toString(),
          imageUrl: m.imageUrl ? getImageUrl(m.imageUrl) : null,
          description: m.description ?? null,
          externalUrl: m.externalUrl ?? null,
        }))}
      />

      <NewsletterSection />

      <ContactSection />
    </main>
  );
}
