import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const aboutBody = `"side hustle practice" is a research-driven art collective dedicated to developing organic and financially sustainable modes of presenting art, while fostering meaningful connections between artists and audiences.

Our practices include Writings & Reports, Events & Exhibitions, and Merchandise & Editions.

As a research-driven art collective, sustained academic inquiry and writing form the foundation of "side hustle practice." For artists participating in "The Artists Archiving" project, we maintain long-term engagement with their practices and lives, producing ongoing reviews, journals, and interviews. Beyond this, we actively collaborate with scholars, practitioners, and writers across disciplines to publish essays and thematic research. These written outputs run parallel to our exhibitions and events, forming a dynamic dialogue between theory and practice.

We believe that understanding and trust emerge from shared contexts and lived experiences. Besides exhibitions, we curate and host a wide range of events in collaboration with artists—including raves, parties, talks, supper clubs, and workshops—to create environments where audiences can encounter artists as peers, and engage with art through direct experience. Through this approach, we aim to cultivate an "organic understanding" of art, while achieving precise, highly engaging, and personalized forms of artist promotion.

Merchandise and editions serve as one of the key channels through which "side hustle practice" supports artists in generating additional income. At the same time, we value the sense of enjoyment and fulfillment artists can gain through this process. We focus on translating artists' ideas, expressions, and creative impulses beyond their primary artistic practice into marketable formats. Merchandise is positioned within everyday functional objects, while editions are developed as accessible and affordable collectibles, each tailored to different audiences and distribution channels.

`;

const newsItems = [
  {
    slug: 'long-table-discussion-double-shifts',
    title: 'Long Table Discussion: Double Shifts',
    publishedAt: new Date('2026-06-05'),
    body: `Artist featured: Millie-Sixu Chen

Inspired by Millie-Sixu Chen's first review written for side hustle practice, in which she reflects on the unexpected joy she finds in working as a barista, this long table discussion explores the often-overlooked relationship between art and hospitality.

While many artists and art workers enter the hospitality sector out of necessity, the experience is frequently more complex than a simple compromise for survival. For some, it becomes a parallel site of learning, care, and even creative fulfilment.

This discussion invites participants to share personal experiences of moving between these two worlds, reflecting on the motivations, contradictions, and rewards embedded within such dual practices. The event adopts a "tap in & out" format, encouraging fluid participation and collective conversation.

Refreshments and desserts will be provided in collaboration with juju home and YANWU.

Date: Early June 2026 (TBC)
Venue: E2 0EL, London
Capacity: ~30`,
  },
  {
    slug: 'launching-day-rave-2026',
    title: 'Launching Day Rave — The Artists Archiving Vol.1',
    publishedAt: new Date('2026-06-20'),
    body: `Artist featured: Jack Warne

This launching rave celebrates the release of side hustle practice, transforming The Horse Hospital into an immersive audiovisual environment. Featuring the work of Jack Warne, the event presents his artistic practice through an immersive art format, dissolving the boundary between sound, space, and audience. Warne himself will take over the decks for a live DJ set, activating the space through his sonic language. The rave invites audiences to experience artistic production not only as exhibition, but as atmosphere, rhythm, and collective presence.

To listen to Jack Warne's work, search "GUAUNT" on Spotify.

Date: Mid–Late June 2026 (TBC)
Venue: The Horse Hospital, London
Capacity: 150`,
  },
  {
    slug: 'panel-discussion-the-labour-of-love',
    title: 'Panel Discussion: The Labour of Love?',
    publishedAt: new Date('2026-06-20'),
    body: `Artists featured: Millie-Sixu Chen, Jack Warne

Taking place prior to the rave, this panel discussion forms a critical part of the side hustle practice launch event. Titled The Labour of Love?, the conversation addresses a persistent question within the art world: is working in the arts destined to be an act of passion sustained at the expense of fair compensation?

Bringing together practitioners from across the sector, the panel explores the structural undervaluation of artistic labour, the imbalance between workload and remuneration, and the systemic conditions that perpetuate these issues. Through open dialogue, the speakers and audience will collectively reflect on both the roots of the problem and potential strategies for resistance and change.

Guest Speakers: Ying Tan (Senior Progs Manager & Trustee, ArtFund), Sarah Whiston (Accountant, Barbican Center), Chasity Johnson (Senior Digital Marketing Manager), Andy Marsh (Head of Department, CCC, CSM).

Date: Mid–Late June 2026 (TBC)
Venue: The Horse Hospital, London
Capacity: 80`,
  },
  {
    slug: 'performance-a-2cm-wound',
    title: 'Performance: A 2cm Wound',
    publishedAt: new Date('2026-06-05'),
    body: `Artist featured: Millie-Sixu Chen

A 2cm Wound is a live performance work by Millie-Sixu Chen.

The performance will be staged twice: once on the launch day of side hustle practice, and again during the Long Table Discussion, allowing it to resonate across different contexts of gathering and exchange.

Dates: Early June 2026 & Mid–Late June 2026 (TBC)
Venues: E2 0EL & The Horse Hospital, London
Capacities: ~80 & 150`,
  },
  {
    slug: 'cocktail-and-create-shanghai',
    title: 'Cocktail & Create Workshop — Shanghai',
    publishedAt: new Date('2026-07-25'),
    body: `Artist featured: Pai'an Chen

A hands-on workshop in collaboration with Pai'an Chen, bringing together art, cocktails, and creative exchange in an intimate setting.

Date: Late July 2026 (TBC)
Venue: Kaisha, Shanghai
Capacity: ~25`,
  },
  {
    slug: 'swing-dance-workshop-shanghai',
    title: 'Swing Dance Workshop — Shanghai',
    publishedAt: new Date('2026-08-01'),
    body: `Part of "The Artists Archiving" Vol.1 events programme in Shanghai.

A recurring swing dance workshop running every Friday throughout August, creating a social and embodied space for audience and artist connection.

Date: Every Friday of August 2026
Venue: 285 West Jianguo Rd., Xuhui District, Shanghai
Capacity: ~40`,
  },
  {
    slug: 'jewelry-design-workshop-shanghai',
    title: 'Jewelry Design Workshop — Shanghai',
    publishedAt: new Date('2026-08-15'),
    body: `Artist featured: Millie-Sixu Chen

A jewelry design workshop led in collaboration with Millie-Sixu Chen, translating her sculptural sensibility into wearable form.

Date: Mid August 2026 (TBC)
Venue: SOOFA, 2nd floor, Suhe Haus, Shanghai
Capacity: ~30`,
  },
  {
    slug: 'day-rave-beijing-baihui',
    title: 'Day Rave featuring BAIHUI — Beijing',
    publishedAt: new Date('2026-08-25'),
    body: `Part of "The Artists Archiving" Vol.1 events programme in Beijing.

A daytime rave featuring BAIHUI, hosted at Galerie Urs Meile's 弦 space in the 798 Art District. Venue kindly provided by Galerie Urs Meile.

Date: Late August 2026 (TBC)
Venue: Galerie Urs Meile 弦, 798 District, Beijing
Capacity: ~60`,
  },
];

async function main() {
  // About page
  await prisma.page.upsert({
    where: { slug: 'about' },
    update: { title: 'About', body: aboutBody },
    create: { slug: 'about', title: 'About', body: aboutBody },
  });
  console.log('✓ About page updated');

  // The Artists Archiving Vol.1 project
  await prisma.project.upsert({
    where: { slug: 'the-artists-archiving-vol-1' },
    update: {
      title: 'The Artists Archiving Vol.1',
      description: `"The Artists Archiving" project originates from a simple intention: to document the artist as a whole person, rather than solely through their finished works.

Through a dedicated backend portal, participating artists can log in and upload updates on their ongoing practice, as well as reflections on their current creative state. These submissions may take the form of text, images, or video.

We envision each artist's archive as an open, evolving diary—one that captures not only the work itself, but also the processes behind it and the narratives beyond it.

In doing so, the archive offers audiences and collectors a more nuanced and multidimensional understanding of the artist, while also providing the artist with a structured record—one that allows them to trace the evolution of their practice, and to revisit and reflect upon it over time.

Vol.1 features three artists: Millie-Sixu Chen (b.2000), Pai'an Chen (b.1988), and Jack Warne (b.1995).`,
      status: 'active',
      featured: true,
      startDate: new Date('2026-06-01'),
    },
    create: {
      slug: 'the-artists-archiving-vol-1',
      title: 'The Artists Archiving Vol.1',
      description: `"The Artists Archiving" project originates from a simple intention: to document the artist as a whole person, rather than solely through their finished works.

Through a dedicated backend portal, participating artists can log in and upload updates on their ongoing practice, as well as reflections on their current creative state. These submissions may take the form of text, images, or video.

We envision each artist's archive as an open, evolving diary—one that captures not only the work itself, but also the processes behind it and the narratives beyond it.

In doing so, the archive offers audiences and collectors a more nuanced and multidimensional understanding of the artist, while also providing the artist with a structured record—one that allows them to trace the evolution of their practice, and to revisit and reflect upon it over time.

Vol.1 features three artists: Millie-Sixu Chen (b.2000), Pai'an Chen (b.1988), and Jack Warne (b.1995).`,
      status: 'active',
      featured: true,
      startDate: new Date('2026-06-01'),
    },
  });
  console.log('✓ Project: The Artists Archiving Vol.1');

  // News / events
  for (const item of newsItems) {
    await prisma.newsItem.upsert({
      where: { slug: item.slug },
      update: { title: item.title, body: item.body, publishedAt: item.publishedAt },
      create: item,
    });
    console.log(`✓ News: ${item.title}`);
  }

  console.log('\nContent seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
