import { readFile } from 'fs/promises';
import { join, normalize, relative as pathRelative } from 'path';
import { NextResponse } from 'next/server';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

// Use UPLOADS_DIR env var for Railway persistent volume; fall back to public/uploads
function getUploadsBase() {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'public', 'uploads');
}

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  const uploadsBase = normalize(getUploadsBase());
  const filePath = normalize(join(uploadsBase, ...params.path));

  // Prevent path traversal — works on Windows (\) and Linux (/) alike
  const rel = pathRelative(uploadsBase, filePath);
  if (!rel || rel.startsWith('..') || rel.includes('\0')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const file = await readFile(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME[ext] ?? 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
