import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gameCache, cacheKeys } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = cacheKeys.game(gameId);
    const cached = gameCache.cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for game ${gameId}`);
      return NextResponse.json(cached);
    }

    console.log(`Cache miss for game ${gameId}`);

    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            hand: {
              where: { location: 'HAND' },
              orderBy: { order: 'asc' }
            },
            player: true
          },
          orderBy: { order: 'asc' }
        },
        cards: {
          where: { location: 'DISCARD' },
          orderBy: { order: 'desc' },
          take: 1
        },
        turns: {
          include: {
            player: true
          },
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Format game state for frontend
    const gameState = {
      id: game.id,
      status: game.status.toLowerCase(),
      direction: game.direction.toLowerCase(),
      currentPlayerIndex: game.currentPlayerIndex,
      topCard: game.cards[0] ? {
        id: game.cards[0].id,
        color: game.cards[0].color,
        value: game.cards[0].value,
        display: game.cards[0].display
      } : null,
      deck: [], // Would need to query all deck cards
      discardPile: game.cards.map(card => ({
        id: card.id,
        color: card.color,
        value: card.value,
        display: card.display
      })),
      winner: game.winner,
      players: game.players.map(player => ({
        id: player.id,
        name: player.name,
        hand: player.hand.map(card => ({
          id: card.id,
          color: card.color,
          value: card.value,
          display: card.display
        })),
        score: player.score,
        saidUno: player.saidUno
      })),
      turnHistory: game.turns.map(turn => ({
        player: turn.player.name || 'Unknown',
        action: turn.action,
        timestamp: turn.timestamp.toISOString()
      }))
    };

    // Cache the response
    gameCache.cache.set(cacheKey, gameState);

    return NextResponse.json(gameState);
  } catch (error) {
    console.error('Error getting game state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to invalidate game cache
export async function invalidateGameCache(gameId: string) {
  const cacheKey = cacheKeys.game(gameId);
  gameCache.cache.delete(cacheKey);
  console.log(`Invalidated cache for game ${gameId}`);
}