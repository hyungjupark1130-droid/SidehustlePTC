import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  const uploadsBase = join(process.cwd(), 'public', 'uploads');
  const filePath = join(uploadsBase, ...params.path);

  // Prevent path traversal
  if (!filePath.startsWith(uploadsBase + '/') && filePath !== uploadsBase) {
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
