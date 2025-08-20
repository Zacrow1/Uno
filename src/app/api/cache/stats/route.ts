import { NextRequest, NextResponse } from 'next/server';
import { gameCache, playerCache, gameStatsCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const stats = {
      gameCache: gameCache.getStats(),
      playerCache: playerCache.getStats(),
      gameStatsCache: gameStatsCache.getStats(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'clear':
        gameCache.cache.clear();
        playerCache.cache.clear();
        gameStatsCache.cache.clear();
        return NextResponse.json({ message: 'All caches cleared' });
      
      case 'cleanup':
        const gameCleaned = gameCache.cleanup();
        const playerCleaned = playerCache.cleanup();
        const statsCleaned = gameStatsCache.cleanup();
        return NextResponse.json({ 
          message: 'Cache cleanup completed',
          cleaned: {
            game: gameCleaned,
            player: playerCleaned,
            stats: statsCleaned
          }
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing cache action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}