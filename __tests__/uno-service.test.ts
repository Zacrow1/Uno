import { joinGame, playCard, drawCard } from '@/lib/uno-service';
import { Result } from '@/lib/result';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    game: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    user: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    gamePlayer: {
      create: jest.fn(),
      findFirst: jest.fn()
    },
    gameCard: {
      update: jest.fn(),
      findFirst: jest.fn()
    },
    turn: {
      create: jest.fn()
    }
  }
}));

const mockDb = require('@/lib/db').db;

describe('UNO Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('joinGame', () => {
    test('should join game successfully with valid data', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'WAITING',
        players: []
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@uno.local',
        name: 'Test Player'
      };

      const mockGamePlayer = {
        id: 'gameplayer-1',
        gameId: 'game-1',
        playerId: 'user-1',
        name: 'Test Player',
        score: 0,
        saidUno: false,
        player: mockUser
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);
      mockDb.user.findFirst.mockResolvedValue(null);
      mockDb.user.create.mockResolvedValue(mockUser);
      mockDb.gamePlayer.create.mockResolvedValue(mockGamePlayer);

      const result = await joinGame('game-1', { name: 'Test Player' });

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.name).toBe('Test Player');
        expect(result.value.id).toBe('gameplayer-1');
      }
    });

    test('should return error for empty player name', async () => {
      const result = await joinGame('game-1', { name: '' });

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Player name is required');
      }
    });

    test('should return error for player name too short', async () => {
      const result = await joinGame('game-1', { name: 'A' });

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Player name must be at least 2 characters long');
      }
    });

    test('should return error for player name too long', async () => {
      const longName = 'A'.repeat(21);
      const result = await joinGame('game-1', { name: longName });

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Player name must be less than 20 characters');
      }
    });

    test('should return error when game not found', async () => {
      mockDb.game.findUnique.mockResolvedValue(null);

      const result = await joinGame('nonexistent-game', { name: 'Test Player' });

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Game not found');
      }
    });

    test('should return error when game already started', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'PLAYING',
        players: []
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);

      const result = await joinGame('game-1', { name: 'Test Player' });

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Game has already started');
      }
    });

    test('should return error when game is full', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'WAITING',
        players: [{}, {}, {}, {}] // 4 players
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);

      const result = await joinGame('game-1', { name: 'Test Player' });

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Game is full (maximum 4 players)');
      }
    });

    test('should return error when player name already taken', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'WAITING',
        players: [{ name: 'Test Player' }]
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);

      const result = await joinGame('game-1', { name: 'Test Player' });

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Player name already taken');
      }
    });

    test('should normalize player name', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'WAITING',
        players: []
      };

      const mockUser = {
        id: 'user-1',
        email: 'test@uno.local',
        name: 'Test Player'
      };

      const mockGamePlayer = {
        id: 'gameplayer-1',
        gameId: 'game-1',
        playerId: 'user-1',
        name: 'Test Player',
        score: 0,
        saidUno: false,
        player: mockUser
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);
      mockDb.user.findFirst.mockResolvedValue(null);
      mockDb.user.create.mockResolvedValue(mockUser);
      mockDb.gamePlayer.create.mockResolvedValue(mockGamePlayer);

      const result = await joinGame('game-1', { name: '  test  player  ' });

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.name).toBe('test player');
      }
    });
  });

  describe('playCard', () => {
    test('should play card successfully', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'PLAYING',
        currentPlayerIndex: 0,
        players: [
          { id: 'player-1', name: 'Test Player' }
        ]
      };

      const mockGamePlayer = {
        id: 'player-1',
        name: 'Test Player',
        hand: [
          { id: 'card-1', color: 'red', value: '5', display: 'Red 5' }
        ]
      };

      const mockTopCard = {
        id: 'card-top',
        color: 'red',
        value: '3',
        display: 'Red 3'
      };

      const mockNextPlayer = {
        id: 'player-2',
        name: 'Next Player'
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);
      mockDb.gamePlayer.findFirst.mockResolvedValue(mockGamePlayer);
      mockDb.gameCard.findFirst.mockResolvedValue(mockTopCard);
      mockDb.gameCard.update.mockResolvedValue({});
      mockDb.turn.create.mockResolvedValue({});
      mockDb.game.update.mockResolvedValue({});
      mockDb.gamePlayer.findFirst.mockResolvedValue(mockNextPlayer);

      const result = await playCard('game-1', 'player-1', 'card-1');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.success).toBe(true);
        expect(result.value.nextPlayer).toBe('Next Player');
      }
    });

    test('should return error when game not found', async () => {
      mockDb.game.findUnique.mockResolvedValue(null);

      const result = await playCard('nonexistent-game', 'player-1', 'card-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Game not found');
      }
    });

    test('should return error when game not in progress', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'WAITING',
        currentPlayerIndex: 0,
        players: []
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);

      const result = await playCard('game-1', 'player-1', 'card-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Game is not in progress');
      }
    });

    test('should return error when not player turn', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'PLAYING',
        currentPlayerIndex: 1,
        players: [
          { id: 'player-1', name: 'Test Player' },
          { id: 'player-2', name: 'Other Player' }
        ]
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);

      const result = await playCard('game-1', 'player-1', 'card-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Not your turn');
      }
    });

    test('should return error when card not found in player hand', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'PLAYING',
        currentPlayerIndex: 0,
        players: [
          { id: 'player-1', name: 'Test Player' }
        ]
      };

      const mockGamePlayer = {
        id: 'player-1',
        name: 'Test Player',
        hand: [] // Empty hand
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);
      mockDb.gamePlayer.findFirst.mockResolvedValue(mockGamePlayer);

      const result = await playCard('game-1', 'player-1', 'card-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Card not found in player hand');
      }
    });
  });

  describe('drawCard', () => {
    test('should draw card successfully', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'PLAYING',
        currentPlayerIndex: 0,
        players: [
          { id: 'player-1', name: 'Test Player' }
        ]
      };

      const mockDeckCard = {
        id: 'card-1',
        color: 'blue',
        value: '7',
        display: 'Blue 7'
      };

      const mockNextPlayer = {
        id: 'player-2',
        name: 'Next Player'
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);
      mockDb.gameCard.findFirst.mockResolvedValue(mockDeckCard);
      mockDb.gameCard.update.mockResolvedValue({});
      mockDb.turn.create.mockResolvedValue({});
      mockDb.game.update.mockResolvedValue({});
      mockDb.gamePlayer.findFirst.mockResolvedValue(mockNextPlayer);

      const result = await drawCard('game-1', 'player-1');

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.card.color).toBe('blue');
        expect(result.value.card.value).toBe('7');
        expect(result.value.nextPlayer).toBe('Next Player');
      }
    });

    test('should return error when game not found', async () => {
      mockDb.game.findUnique.mockResolvedValue(null);

      const result = await drawCard('nonexistent-game', 'player-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Game not found');
      }
    });

    test('should return error when game not in progress', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'WAITING',
        currentPlayerIndex: 0,
        players: []
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);

      const result = await drawCard('game-1', 'player-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Game is not in progress');
      }
    });

    test('should return error when not player turn', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'PLAYING',
        currentPlayerIndex: 1,
        players: [
          { id: 'player-1', name: 'Test Player' },
          { id: 'player-2', name: 'Other Player' }
        ]
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);

      const result = await drawCard('game-1', 'player-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('Not your turn');
      }
    });

    test('should return error when no cards left in deck', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'PLAYING',
        currentPlayerIndex: 0,
        players: [
          { id: 'player-1', name: 'Test Player' }
        ]
      };

      mockDb.game.findUnique.mockResolvedValue(mockGame);
      mockDb.gameCard.findFirst.mockResolvedValue(null);

      const result = await drawCard('game-1', 'player-1');

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.value).toBe('No cards left in deck');
      }
    });
  });
});