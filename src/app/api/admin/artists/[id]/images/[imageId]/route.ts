import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/admin/permissions';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  const { allowed } = await checkPermission('artists', 'update');
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.artistImage.delete({ where: { id: params.imageId } });
  return NextResponse.json({ success: true });
}
