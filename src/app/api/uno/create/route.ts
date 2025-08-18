import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Result } from '@/lib/result';

const generateDeck = (gameId: string) => {
  const cards = [];
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'];
  
  let order = 0;
  
  // Add colored cards (2 of each except 0)
  colors.forEach(color => {
    values.forEach(value => {
      cards.push({
        gameId,
        color,
        value,
        display: `${color.charAt(0).toUpperCase() + color.slice(1)} ${value}`,
        location: 'DECK' as const,
        order: order++
      });
      
      // Add second copy for non-zero cards
      if (value !== '0') {
        cards.push({
          gameId,
          color,
          value,
          display: `${color.charAt(0).toUpperCase() + color.slice(1)} ${value}`,
          location: 'DECK' as const,
          order: order++
        });
      }
    });
  });
  
  // Add wild cards
  for (let i = 0; i < 4; i++) {
    cards.push({
      gameId,
      color: 'wild',
      value: 'Wild',
      display: 'Wild',
      location: 'DECK' as const,
      order: order++
    });
    
    cards.push({
      gameId,
      color: 'wild',
      value: 'Wild Draw Four',
      display: 'Wild Draw Four',
      location: 'DECK' as const,
      order: order++
    });
  }
  
  return cards;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorName } = body;

    if (!creatorName || creatorName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Creator name is required' },
        { status: 400 }
      );
    }

    const result = await Result.async(async () => {
      // Create game
      const game = await db.game.create({
        data: {
          status: 'WAITING',
          direction: 'CLOCKWISE',
          currentPlayerIndex: 0
        }
      });

      // Create deck
      const deckCards = generateDeck(game.id);
      await db.gameCard.createMany({
        data: deckCards
      });

      // Create creator user if not exists
      let user = await db.user.findFirst({
        where: { email: `${creatorName.toLowerCase()}@uno.local` }
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email: `${creatorName.toLowerCase()}@uno.local`,
            name: creatorName
          }
        });
      }

      // Add creator as first player
      const gamePlayer = await db.gamePlayer.create({
        data: {
          gameId: game.id,
          playerId: user.id,
          name: creatorName,
          score: 0,
          saidUno: false,
          order: 0
        }
      });

      return {
        gameId: game.id,
        playerId: gamePlayer.id,
        message: 'Game created successfully'
      };
    });

    if (result.isErr) {
      console.error('Error creating game:', result.value);
      return NextResponse.json(
        { error: 'Failed to create game' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}