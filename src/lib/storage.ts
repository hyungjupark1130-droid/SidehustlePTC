import path from 'path';
import fs from 'fs/promises';

// Production: swap this implementation to use S3/Cloudinary/UploadThing.
// Keep the uploadImage(file) signature stable so callers don't change.

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function uploadImage(file: File): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split('.').pop() ?? 'bin';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dest = path.join(UPLOAD_DIR, name);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buffer);

  return `/uploads/${name}`;
}
