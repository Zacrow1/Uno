import { NextRequest, NextResponse } from 'next/server';
import { playCard } from '@/lib/uno-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, playerId, cardId } = body;

    if (!gameId || !playerId || !cardId) {
      return NextResponse.json(
        { error: 'Game ID, player ID, and card ID are required' },
        { status: 400 }
      );
    }

    const result = await playCard(gameId, playerId, cardId);

    if (result.isErr) {
      return NextResponse.json(
        { error: result.value },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Card played successfully',
      ...result.value
    });
  } catch (error) {
    console.error('Error playing card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}