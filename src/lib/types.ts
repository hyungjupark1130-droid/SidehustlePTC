// Shared TypeScript types used across the app

export interface ArtistSummary {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  nationality?: string | null;
  featured: boolean;
}

export interface ArtistDetail extends ArtistSummary {
  bio?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  images: { id: string; url: string; alt: string; order: number }[];
  works: {
    id: string;
    title: string;
    year?: number | null;
    medium?: string | null;
    dimensions?: string | null;
    imageUrl?: string | null;
    description?: string | null;
  }[];
}

export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: string;
  featured: boolean;
}

export interface PublicationSummary {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  publishedAt?: Date | null;
  coverUrl?: string | null;
  description?: string | null;
  externalUrl?: string | null;
}

export interface NewsItemSummary {
  id: string;
  slug: string;
  title: string;
  body: string;
  publishedAt: Date;
  image?: string | null;
}

export interface MerchandiseItemSummary {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  externalUrl?: string | null;
  inStock: boolean;
}
