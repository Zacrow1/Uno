import { db } from './db';
import { Result } from './result';

// Types for UNO game
export interface UnoCard {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string;
  display: string;
}

export interface UnoPlayer {
  id: string;
  name: string;
  hand: UnoCard[];
  score: number;
  saidUno: boolean;
}

export interface UnoGame {
  id: string;
  players: UnoPlayer[];
  currentPlayerIndex: number;
  direction: 'clockwise' | 'counterclockwise';
  topCard: UnoCard | null;
  deck: UnoCard[];
  discardPile: UnoCard[];
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
}

// Card validation functions
const validatePlayerData = (playerData: { name: string }): Result<void, string> => {
  if (!playerData.name || playerData.name.trim().length === 0) {
    return Result.Err('Player name is required');
  }
  
  if (playerData.name.trim().length < 2) {
    return Result.Err('Player name must be at least 2 characters long');
  }
  
  if (playerData.name.trim().length > 20) {
    return Result.Err('Player name must be less than 20 characters');
  }
  
  return Result.Ok(undefined);
};

const normalizePlayerName = (playerData: { name: string }): { name: string } => {
  return {
    name: playerData.name.trim().replace(/\s+/g, ' ')
  };
};

const canJoinGame = async (gameId: string, playerName: string): Promise<Result<void, string>> => {
  try {
    // Check if game exists and is in waiting state
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (!game) {
      return Result.Err('Game not found');
    }

    if (game.status !== 'WAITING') {
      return Result.Err('Game has already started');
    }

    if (game.players.length >= 4) {
      return Result.Err('Game is full (maximum 4 players)');
    }

    // Check if player name is already taken
    const playerExists = game.players.some(p => p.name === playerName);
    if (playerExists) {
      return Result.Err('Player name already taken');
    }

    return Result.Ok(undefined);
  } catch (error) {
    return Result.Err('Failed to validate game join');
  }
};

const createPlayerInGame = async (gameId: string, playerName: string): Promise<Result<UnoPlayer, string>> => {
  try {
    // Create user if not exists
    let user = await db.user.findFirst({
      where: { email: `${playerName.toLowerCase()}@uno.local` }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: `${playerName.toLowerCase()}@uno.local`,
          name: playerName
        }
      });
    }

    // Create game player
    const gamePlayer = await db.gamePlayer.create({
      data: {
        gameId,
        playerId: user.id,
        name: playerName,
        score: 0,
        saidUno: false
      },
      include: {
        player: true
      }
    });

    const player: UnoPlayer = {
      id: gamePlayer.id,
      name: gamePlayer.name,
      hand: [],
      score: gamePlayer.score,
      saidUno: gamePlayer.saidUno
    };

    return Result.Ok(player);
  } catch (error) {
    return Result.Err('Failed to create player in game');
  }
};

// Main service functions
export const joinGame = async (gameId: string, playerData: { name: string }): Promise<Result<UnoPlayer, string>> => {
  return Result.Ok(playerData)
    .map(normalizePlayerName)
    .flatMap(normalizedData => validatePlayerData(normalizedData))
    .flatMap(() => canJoinGame(gameId, playerData.name))
    .flatMap(() => createPlayerInGame(gameId, playerData.name));
};

// Card validation for playing
const validateCardPlay = (card: UnoCard, topCard: UnoCard | null): Result<void, string> => {
  if (!topCard) {
    return Result.Err('No top card to compare with');
  }

  // Wild cards can always be played
  if (card.color === 'wild') {
    return Result.Ok(undefined);
  }

  // Check if color matches
  if (card.color === topCard.color) {
    return Result.Ok(undefined);
  }

  // Check if value matches
  if (card.value === topCard.value) {
    return Result.Ok(undefined);
  }

  return Result.Err('Card does not match color or value');
};

const canPlayerPlayCard = async (
  gameId: string, 
  playerId: string, 
  cardId: string
): Promise<Result<void, string>> => {
  try {
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            hand: true
          }
        },
        cards: {
          where: { location: 'DISCARD' },
          orderBy: { order: 'desc' },
          take: 1
        }
      }
    });

    if (!game) {
      return Result.Err('Game not found');
    }

    if (game.status !== 'PLAYING') {
      return Result.Err('Game is not in progress');
    }

    // Check if it's player's turn
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return Result.Err('Not your turn');
    }

    // Check if player has the card
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      return Result.Err('Player not found in game');
    }

    const card = player.hand.find(c => c.id === cardId);
    if (!card) {
      return Result.Err('Card not found in player hand');
    }

    // Get top card from discard pile
    const topCard = game.cards[0];
    if (!topCard) {
      return Result.Err('No top card found');
    }

    // Validate card play
    return validateCardPlay(card, topCard);
  } catch (error) {
    return Result.Err('Failed to validate card play');
  }
};

export const playCard = async (
  gameId: string, 
  playerId: string, 
  cardId: string
): Promise<Result<{ success: boolean; nextPlayer: string }, string>> => {
  return Result.Ok({ gameId, playerId, cardId })
    .flatMap(() => canPlayerPlayCard(gameId, playerId, cardId))
    .flatMap(async () => {
      try {
        // Move card from player hand to discard pile
        await db.gameCard.update({
          where: { id: cardId },
          data: { 
            location: 'DISCARD',
            playerId: null 
          }
        });

        // Record turn
        await db.turn.create({
          data: {
            gameId,
            playerId,
            action: 'Played card',
            cardId
          }
        });

        // Get next player index
        const game = await db.game.findUnique({ where: { id: gameId } });
        if (!game) {
          return Result.Err('Game not found');
        }

        const nextPlayerIndex = (game.currentPlayerIndex + 1) % 4; // Assuming 4 players max
        const nextPlayer = await db.gamePlayer.findFirst({
          where: { gameId, order: nextPlayerIndex }
        });

        if (!nextPlayer) {
          return Result.Err('Next player not found');
        }

        // Update current player index
        await db.game.update({
          where: { id: gameId },
          data: { currentPlayerIndex: nextPlayerIndex }
        });

        return Result.Ok({ 
          success: true, 
          nextPlayer: nextPlayer.name 
        });
      } catch (error) {
        return Result.Err('Failed to play card');
      }
    });
};

// Draw card validation and execution
const canPlayerDrawCard = async (gameId: string, playerId: string): Promise<Result<void, string>> => {
  try {
    const game = await db.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (!game) {
      return Result.Err('Game not found');
    }

    if (game.status !== 'PLAYING') {
      return Result.Err('Game is not in progress');
    }

    // Check if it's player's turn
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return Result.Err('Not your turn');
    }

    return Result.Ok(undefined);
  } catch (error) {
    return Result.Err('Failed to validate draw card');
  }
};

export const drawCard = async (
  gameId: string, 
  playerId: string
): Promise<Result<{ card: UnoCard; nextPlayer: string }, string>> => {
  return Result.Ok({ gameId, playerId })
    .flatMap(() => canPlayerDrawCard(gameId, playerId))
    .flatMap(async () => {
      try {
        // Get a card from deck
        const deckCard = await db.gameCard.findFirst({
          where: { gameId, location: 'DECK' },
          orderBy: { order: 'asc' }
        });

        if (!deckCard) {
          return Result.Err('No cards left in deck');
        }

        // Move card to player hand
        await db.gameCard.update({
          where: { id: deckCard.id },
          data: { 
            location: 'HAND',
            playerId 
          }
        });

        // Record turn
        await db.turn.create({
          data: {
            gameId,
            playerId,
            action: 'Drew card'
          }
        });

        // Get next player index
        const game = await db.game.findUnique({ where: { id: gameId } });
        if (!game) {
          return Result.Err('Game not found');
        }

        const nextPlayerIndex = (game.currentPlayerIndex + 1) % 4;
        const nextPlayer = await db.gamePlayer.findFirst({
          where: { gameId, order: nextPlayerIndex }
        });

        if (!nextPlayer) {
          return Result.Err('Next player not found');
        }

        // Update current player index
        await db.game.update({
          where: { id: gameId },
          data: { currentPlayerIndex: nextPlayerIndex }
        });

        const card: UnoCard = {
          id: deckCard.id,
          color: deckCard.color as any,
          value: deckCard.value,
          display: deckCard.display
        };

        return Result.Ok({ 
          card, 
          nextPlayer: nextPlayer.name 
        });
      } catch (error) {
        return Result.Err('Failed to draw card');
      }
    });
};