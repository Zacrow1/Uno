import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Result } from '@/lib/result';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const result = await Result.async(async () => {
      const game = await db.game.findUnique({
        where: { id: gameId },
        include: { players: true }
      });

      if (!game) {
        throw new Error('Game not found');
      }

      if (game.status !== 'WAITING') {
        throw new Error('Game has already started');
      }

      if (game.players.length < 2) {
        throw new Error('Need at least 2 players to start');
      }

      // Deal initial cards (7 cards per player)
      const deckCards = await db.gameCard.findMany({
        where: { gameId, location: 'DECK' },
        orderBy: { order: 'asc' }
      });

      let cardIndex = 0;
      
      // Deal 7 cards to each player
      for (const player of game.players) {
        for (let i = 0; i < 7; i++) {
          if (cardIndex < deckCards.length) {
            await db.gameCard.update({
              where: { id: deckCards[cardIndex].id },
              data: {
                location: 'HAND',
                playerId: player.id
              }
            });
            cardIndex++;
          }
        }
      }

      // Put first card on discard pile
      if (cardIndex < deckCards.length) {
        await db.gameCard.update({
          where: { id: deckCards[cardIndex].id },
          data: {
            location: 'DISCARD',
            playerId: null
          }
        });
      }

      // Update game status
      await db.game.update({
        where: { id: gameId },
        data: {
          status: 'PLAYING',
          currentPlayerIndex: 0
        }
      });

      return { message: 'Game started successfully' };
    });

    if (result.isErr) {
      return NextResponse.json(
        { error: result.value instanceof Error ? result.value.message : String(result.value) },
        { status: 400 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}