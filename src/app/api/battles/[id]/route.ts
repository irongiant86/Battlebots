// GET /api/battles/[id] — Battle state ophalen
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const battle = store.getBattle(id);

  if (!battle) {
    return NextResponse.json({ error: 'Battle niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({ battle });
}
