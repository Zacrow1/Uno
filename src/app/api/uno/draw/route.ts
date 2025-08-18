import { NextRequest, NextResponse } from 'next/server';
import { drawCard } from '@/lib/uno-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, playerId } = body;

    if (!gameId || !playerId) {
      return NextResponse.json(
        { error: 'Game ID and player ID are required' },
        { status: 400 }
      );
    }

    const result = await drawCard(gameId, playerId);

    if (result.isErr) {
      return NextResponse.json(
        { error: result.value },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Card drawn successfully',
      ...result.value
    });
  } catch (error) {
    console.error('Error drawing card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}