import { NextRequest, NextResponse } from 'next/server';
import { planCommute } from '@/lib/plan-service';
import { Point } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, departureOffsetMinutes } = body as {
      origin?: Point;
      destination?: Point;
      departureOffsetMinutes?: number;
    };

    if (!origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number') {
      return NextResponse.json(
        { error: 'Valid origin with lat/lng is required' },
        { status: 400 }
      );
    }

    if (!destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
      return NextResponse.json(
        { error: 'Valid destination with lat/lng is required' },
        { status: 400 }
      );
    }

    const offset = typeof departureOffsetMinutes === 'number' ? departureOffsetMinutes : 0;
    const plan = await planCommute(origin, destination, offset);

    return NextResponse.json(plan);
  } catch (err: any) {
    console.error('Plan route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error calculating commute plan' },
      { status: 500 }
    );
  }
}
