// Cache Middleware Integration for UNO Game API Routes
// Lab 7: LRU Cache Implementation

const { gameCache, playerCache, gameStatsCache, cacheKeys } = require('./cache');

// Game API with caching
const withGameCache = (handler) => {
  return async (req, res) => {
    const { gameId } = req.query;
    
    if (!gameId) {
      return handler(req, res);
    }

    const cacheKey = cacheKeys.game(gameId);
    
    // Try to get from cache first
    const cached = gameCache.cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for game ${gameId}`);
      return res.json(cached);
    }

    console.log(`Cache miss for game ${gameId}`);
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      gameCache.cache.set(cacheKey, data);
      return originalJson.call(this, data);
    };

    return handler(req, res);
  };
};

// Player API with caching
const withPlayerCache = (handler) => {
  return async (req, res) => {
    const { playerId } = req.query;
    
    if (!playerId) {
      return handler(req, res);
    }

    const cacheKey = cacheKeys.player(playerId);
    
    // Try to get from cache first
    const cached = playerCache.cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for player ${playerId}`);
      return res.json(cached);
    }

    console.log(`Cache miss for player ${playerId}`);
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      playerCache.cache.set(cacheKey, data);
      return originalJson.call(this, data);
    };

    return handler(req, res);
  };
};

// Game stats with caching
const withStatsCache = (handler) => {
  return async (req, res) => {
    const cacheKey = cacheKeys.leaderboard();
    
    // Try to get from cache first
    const cached = gameStatsCache.cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit for leaderboard');
      return res.json(cached);
    }

    console.log('Cache miss for leaderboard');
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      gameStatsCache.cache.set(cacheKey, data);
      return originalJson.call(this, data);
    };

    return handler(req, res);
  };
};

// Cache invalidation utilities
const invalidateGameCache = (gameId) => {
  const gameKey = cacheKeys.game(gameId);
  const playersKey = cacheKeys.gamePlayers(gameId);
  const historyKey = cacheKeys.gameHistory(gameId);
  
  gameCache.cache.delete(gameKey);
  gameCache.cache.delete(playersKey);
  gameCache.cache.delete(historyKey);
  
  console.log(`Invalidated cache for game ${gameId}`);
};

const invalidatePlayerCache = (playerId) => {
  const playerKey = cacheKeys.player(playerId);
  const statsKey = cacheKeys.playerStats(playerId);
  
  playerCache.cache.delete(playerKey);
  playerCache.cache.delete(statsKey);
  
  console.log(`Invalidated cache for player ${playerId}`);
};

const invalidateStatsCache = () => {
  const leaderboardKey = cacheKeys.leaderboard();
  gameStatsCache.cache.delete(leaderboardKey);
  
  console.log('Invalidated leaderboard cache');
};

// Cache statistics endpoint
const getCacheStats = () => {
  return {
    gameCache: gameCache.getStats(),
    playerCache: playerCache.getStats(),
    gameStatsCache: gameStatsCache.getStats(),
    timestamp: new Date().toISOString(),
  };
};

// Periodic cache cleanup
const startCacheCleanup = (interval = 5 * 60 * 1000) => {
  setInterval(() => {
    const gameCleaned = gameCache.cleanup();
    const playerCleaned = playerCache.cleanup();
    const statsCleaned = gameStatsCache.cleanup();
    
    if (gameCleaned > 0 || playerCleaned > 0 || statsCleaned > 0) {
      console.log(`Cache cleanup: ${gameCleaned} game, ${playerCleaned} player, ${statsCleaned} stats entries removed`);
    }
  }, interval);
};

module.exports = {
  withGameCache,
  withPlayerCache,
  withStatsCache,
  invalidateGameCache,
  invalidatePlayerCache,
  invalidateStatsCache,
  getCacheStats,
  startCacheCleanup,
  gameCache,
  playerCache,
  gameStatsCache,
  cacheKeys,
};