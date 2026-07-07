import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.isActive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (user.expiresAt && user.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ext || !ALLOWED_EXTS.includes(ext)) {
    return NextResponse.json({ error: 'File extension not allowed' }, { status: 400 });
  }
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = process.env.UPLOADS_DIR ?? join(process.cwd(), 'public', 'uploads');

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'EACCES' || code === 'EPERM') {
      return NextResponse.json(
        { error: 'Upload directory is not writable. Check UPLOADS_DIR permissions.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to save file.' }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${filename}` });
}
