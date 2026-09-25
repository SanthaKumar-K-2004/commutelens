import { NextRequest, NextResponse } from 'next/server';
import { getEnvironmentContext } from '@/lib/environment';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '17.4100');
  const lng = parseFloat(searchParams.get('lng') || '78.4600');
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const env = await getEnvironmentContext({ lat, lng }, offset);
  return NextResponse.json(env);
}
