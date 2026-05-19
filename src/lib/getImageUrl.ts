/**
 * Abstracts image URL resolution across local public/, S3, and Cloudinary.
 * Add more providers here without touching call-sites.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.svg';

  // Already an absolute URL (S3, Cloudinary, etc.)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Cloudinary public ID
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && !path.startsWith('/')) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${path}`;
  }

  // Local public directory — ensure leading slash
  return path.startsWith('/') ? path : `/${path}`;
}
