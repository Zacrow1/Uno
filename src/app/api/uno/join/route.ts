import { NextRequest, NextResponse } from 'next/server';
import { joinGame } from '@/lib/uno-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, playerName } = body;

    if (!gameId || !playerName) {
      return NextResponse.json(
        { error: 'Game ID and player name are required' },
        { status: 400 }
      );
    }

    const result = await joinGame(gameId, { name: playerName });

    if (result.isErr) {
      return NextResponse.json(
        { error: result.value },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Player joined game successfully',
      player: result.value
    });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}