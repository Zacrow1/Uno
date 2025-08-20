// LRU Cache Middleware for Lab 7
// Configurable Least Recently Used cache implementation

interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  next?: CacheEntry<T>;
  prev?: CacheEntry<T>;
}

interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  enableStats: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  hitRate: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private head: CacheEntry<T> | null = null;
  private tail: CacheEntry<T> | null = null;
  private config: CacheConfig;
  private stats: CacheStats;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default
      enableStats: config.enableStats || true,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      hitRate: 0,
    };
  }

  // Get value from cache
  get(key: string): T | undefined {
    if (this.config.enableStats) {
      this.stats.totalRequests++;
    }

    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.delete(key);
      if (this.config.enableStats) {
        this.stats.misses++;
        this.updateHitRate();
      }
      return undefined;
    }

    // Move to front (most recently used)
    this.moveToFront(entry);
    entry.accessCount++;

    if (this.config.enableStats) {
      this.stats.hits++;
      this.updateHitRate();
    }

    return entry.value;
  }

  // Set value in cache
  set(key: string, value: T): void {
    // Check if key already exists
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      entry.value = value;
      entry.timestamp = Date.now();
      this.moveToFront(entry);
      return;
    }

    // Check if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    // Create new entry
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 0,
    };

    // Add to cache and front of list
    this.cache.set(key, entry);
    this.addToFront(entry);
  }

  // Delete specific key
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    this.cache.delete(key);
    this.removeEntry(entry);
    return true;
  }

  // Clear entire cache
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    
    if (this.config.enableStats) {
      this.stats.evictions += this.cache.size;
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Check if key exists
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  // Get all keys (for debugging)
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Update cache configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // If max size was reduced, evict excess entries
    if (this.cache.size > this.config.maxSize) {
      while (this.cache.size > this.config.maxSize) {
        this.evict();
      }
    }
  }

  // Private helper methods
  private moveToFront(entry: CacheEntry<T>): void {
    this.removeEntry(entry);
    this.addToFront(entry);
  }

  private addToFront(entry: CacheEntry<T>): void {
    entry.next = this.head;
    entry.prev = null;

    if (this.head) {
      this.head.prev = entry;
    } else {
      this.tail = entry;
    }

    this.head = entry;
  }

  private removeEntry(entry: CacheEntry<T>): void {
    if (entry.prev) {
      entry.prev.next = entry.next;
    } else {
      this.head = entry.next;
    }

    if (entry.next) {
      entry.next.prev = entry.prev;
    } else {
      this.tail = entry.prev;
    }

    entry.next = null;
    entry.prev = null;
  }

  private evict(): void {
    if (!this.tail) {
      return;
    }

    const lruKey = this.tail.key;
    this.cache.delete(lruKey);
    this.removeEntry(this.tail);

    if (this.config.enableStats) {
      this.stats.evictions++;
    }
  }

  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests;
    }
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    
    if (this.config.enableStats) {
      this.stats.evictions += expiredKeys.length;
    }

    return expiredKeys.length;
  }
}

// Cache middleware factory for Next.js API routes
export function createCacheMiddleware<T>(config: Partial<CacheConfig> = {}) {
  const cache = new LRUCache<T>(config);

  return {
    // Middleware function for API routes
    middleware: (keyGenerator: (req: any) => string) => {
      return async (req: any, res: any, next: Function) => {
        const cacheKey = keyGenerator(req);
        
        // Try to get from cache
        const cached = cache.get(cacheKey);
        if (cached !== undefined) {
          return res.json(cached);
        }

        // If not in cache, proceed to next handler
        const originalJson = res.json;
        res.json = function(data: T) {
          // Cache the response
          cache.set(cacheKey, data);
          return originalJson.call(this, data);
        };

        next();
      };
    },

    // Direct cache access
    cache,

    // Cache utility functions
    invalidate: (key: string) => cache.delete(key),
    clear: () => cache.clear(),
    getStats: () => cache.getStats(),
    cleanup: () => cache.cleanup(),
  };
}

// Pre-configured cache instances for common use cases
export const gameCache = createCacheMiddleware<any>({
  maxSize: 50,
  ttl: 10 * 60 * 1000, // 10 minutes
  enableStats: true,
});

export const playerCache = createCacheMiddleware<any>({
  maxSize: 200,
  ttl: 5 * 60 * 1000, // 5 minutes
  enableStats: true,
});

export const gameStatsCache = createCacheMiddleware<any>({
  maxSize: 100,
  ttl: 30 * 60 * 1000, // 30 minutes
  enableStats: true,
});

// Utility functions for cache key generation
export const cacheKeys = {
  game: (gameId: string) => `game:${gameId}`,
  player: (playerId: string) => `player:${playerId}`,
  gamePlayers: (gameId: string) => `game:${gameId}:players`,
  gameHistory: (gameId: string) => `game:${gameId}:history`,
  playerStats: (playerId: string) => `player:${playerId}:stats`,
  leaderboard: () => `leaderboard:global`,
};