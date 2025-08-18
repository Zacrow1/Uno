import { Result } from '../utils/result.js';
import functional from '../utils/functional.js';

const { 
    pipe, 
    map, 
    filter, 
    find, 
    head, 
    isEmpty, 
    isNil, 
    curry,
    shuffleArray 
} = functional;

// Game state management
class GameState {
    constructor(gameId) {
        this.gameId = gameId;
        this.currentPlayerIndex = 0;
        this.direction = 1; // 1 for clockwise, -1 for counterclockwise
        this.currentCard = null;
        this.players = [];
        this.playerHands = new Map();
        this.unoDeclared = new Set();
        this.gameHistory = [];
        this.scores = new Map();
        this.isGameActive = false;
    }

    setPlayers(players) {
        this.players = players;
        this.scores = new Map(players.map(p => [p.id, 0]));
    }

    setPlayerHand(playerId, cards) {
        this.playerHands.set(playerId, cards);
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getNextPlayerIndex() {
        const nextIndex = this.currentPlayerIndex + this.direction;
        return nextIndex >= 0 && nextIndex < this.players.length 
            ? nextIndex 
            : nextIndex < 0 
                ? this.players.length - 1 
                : 0;
    }

    advanceTurn() {
        this.currentPlayerIndex = this.getNextPlayerIndex();
    }

    skipNextPlayer() {
        this.currentPlayerIndex = this.getNextPlayerIndex();
        this.advanceTurn();
    }

    reverseDirection() {
        this.direction *= -1;
    }

    declareUno(playerId) {
        this.unoDeclared.add(playerId);
    }

    removeUnoDeclaration(playerId) {
        this.unoDeclared.delete(playerId);
    }

    hasPlayerDeclaredUno(playerId) {
        return this.unoDeclared.has(playerId);
    }

    addToHistory(action) {
        this.gameHistory.push({
            ...action,
            timestamp: new Date().toISOString()
        });
    }

    updateScore(playerId, points) {
        this.scores.set(playerId, (this.scores.get(playerId) || 0) + points);
    }

    getGameStatus() {
        return {
            currentPlayer: this.getCurrentPlayer(),
            currentPlayerIndex: this.currentPlayerIndex,
            direction: this.direction === 1 ? 'clockwise' : 'counterclockwise',
            currentCard: this.currentCard,
            players: this.players.map(p => ({
                id: p.id,
                username: p.username,
                cardCount: this.playerHands.get(p.id)?.length || 0
            })),
            scores: Object.fromEntries(this.scores),
            isGameActive: this.isGameActive,
            history: this.gameHistory.slice(-10) // Last 10 moves
        };
    }
}

// Game state storage (in-memory for now)
const gameStates = new Map();

// Card validation functions
const isValidCardPlay = curry((topCard, playedCard) => {
    if (!topCard) return true; // First card can be anything
    
    // Wild cards can always be played
    if (playedCard.color === 'black') return true;
    
    // Match by color or value
    return playedCard.color === topCard.color || 
           playedCard.value === topCard.value;
});

const getPlayableCards = curry((topCard, playerHand) => {
    return filter(card => isValidCardPlay(topCard, card.card))(playerHand);
});

const hasPlayableCards = curry((topCard, playerHand) => {
    return !isEmpty(getPlayableCards(topCard, playerHand));
});

// UNO rule enforcement
const checkUnoRequirement = (playerId, gameState) => {
    const playerHand = gameState.playerHands.get(playerId) || [];
    if (playerHand.length === 1) {
        return !gameState.hasPlayerDeclaredUno(playerId);
    }
    return false;
};

const handleUnoChallenge = (challengerId, challengedId, gameState) => {
    const challengedHand = gameState.playerHands.get(challengedId) || [];
    const challengedForgotUno = challengedHand.length === 1 && 
                               !gameState.hasPlayerDeclaredUno(challengedId);
    
    if (challengedForgotUno) {
        // Challenged player draws 2 cards as penalty
        return {
            success: true,
            message: `Challenge successful. Player forgot to say UNO and draws 2 cards.`,
            penaltyCards: 2
        };
    } else {
        // Challenger draws 2 cards for false challenge
        return {
            success: false,
            message: `Challenge failed. Player said UNO on time.`,
            penaltyCards: 2,
            penalizedPlayer: challengerId
        };
    }
};

// Special card effects
const applyCardEffect = (card, gameState) => {
    switch (card.value) {
        case 'skip':
            gameState.skipNextPlayer();
            return { effect: 'skip', message: 'Next player skipped!' };
            
        case 'reverse':
            gameState.reverseDirection();
            return { 
                effect: 'reverse', 
                message: `Direction reversed to ${gameState.direction === 1 ? 'clockwise' : 'counterclockwise'}!` 
            };
            
        case 'draw2':
            const nextPlayerIndex = gameState.getNextPlayerIndex();
            const nextPlayer = gameState.players[nextPlayerIndex];
            return { 
                effect: 'draw2', 
                message: 'Next player draws 2 cards!',
                targetPlayer: nextPlayer,
                cardsToDraw: 2
            };
            
        case 'wild':
            return { 
                effect: 'wild', 
                message: 'Wild card played! Choose a color.',
                requiresColorChoice: true 
            };
            
        case 'wild_draw4':
            const targetPlayer = gameState.players[gameState.getNextPlayerIndex()];
            return { 
                effect: 'wild_draw4', 
                message: 'Wild Draw Four played! Next player draws 4 cards.',
                targetPlayer,
                cardsToDraw: 4,
                requiresColorChoice: true 
            };
            
        default:
            return { effect: 'normal', message: 'Card played successfully.' };
    }
};

// Game end detection
const checkGameEnd = (gameState) => {
    for (const [playerId, hand] of gameState.playerHands) {
        if (hand.length === 0) {
            const player = gameState.players.find(p => p.id === playerId);
            return { winner: player, isGameOver: true };
        }
    }
    return { isGameOver: false };
};

// Score calculation
const calculateCardScore = (card) => {
    if (card.color === 'black') {
        return card.value === 'wild_draw4' ? 50 : 50;
    }
    
    if (['skip', 'reverse', 'draw2'].includes(card.value)) {
        return 20;
    }
    
    return parseInt(card.value) || 0;
};

const calculateFinalScores = (gameState, winnerId) => {
    const scores = new Map();
    
    // Calculate points for all other players
    for (const [playerId, hand] of gameState.playerHands) {
        if (playerId !== winnerId) {
            const points = hand.reduce((sum, playerCard) => 
                sum + calculateCardScore(playerCard.card), 0
            );
            scores.set(playerId, points);
        }
    }
    
    // Winner gets the sum of all other players' points
    const winnerPoints = Array.from(scores.values()).reduce((sum, points) => sum + points, 0);
    scores.set(winnerId, winnerPoints);
    
    return Object.fromEntries(scores);
};

// Main game rules service
export const gameRulesService = {
    // Initialize game state
    initializeGame: (gameId, players) => {
        const gameState = new GameState(gameId);
        gameState.setPlayers(players);
        gameState.isGameActive = true;
        gameStates.set(gameId, gameState);
        
        return Result.Ok(gameState);
    },

    // Get game state
    getGameState: (gameId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }
        return Result.Ok(gameState);
    },

    // Deal cards to players
    dealCards: async (gameId, players, cardsPerPlayer = 7) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        // This would be implemented with actual card dealing logic
        // For now, we'll simulate it
        const playersWithCards = {};
        players.forEach(player => {
            playersWithCards[player.username] = [
                'Red 3', 'Blue Skip', 'Green 7', 'Yellow 5', 
                'Red Draw Two', 'Blue 1', 'Green Reverse'
            ].slice(0, cardsPerPlayer);
        });

        gameState.addToHistory({
            player: 'System',
            action: `Dealt ${cardsPerPlayer} cards to each player`
        });

        return Result.Ok({
            message: 'Cards dealt successfully.',
            players: playersWithCards
        });
    },

    // Play a card
    playCard: async (gameId, playerId, cardPlayed) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        const currentPlayer = gameState.getCurrentPlayer();
        if (currentPlayer.id !== playerId) {
            return Result.Err('Not your turn');
        }

        // Parse card (simplified - in real implementation would use card objects)
        const [color, value] = cardPlayed.split(' ');
        const playedCard = { color: color.toLowerCase(), value };

        // Validate card play
        if (gameState.currentCard && !isValidCardPlay(gameState.currentCard, playedCard)) {
            return Result.Err('Invalid card. Please play a card that matches the top card on the discard pile.');
        }

        // Apply card effects
        const effect = applyCardEffect(playedCard, gameState);
        
        // Update game state
        gameState.currentCard = playedCard;
        gameState.advanceTurn();
        
        // Remove UNO declaration if player has more than 1 card
        const playerHand = gameState.playerHands.get(playerId) || [];
        if (playerHand.length <= 1) {
            gameState.removeUnoDeclaration(playerId);
        }

        gameState.addToHistory({
            player: currentPlayer.username,
            action: `Played ${cardPlayed}`,
            effect: effect.effect
        });

        // Check for game end
        const gameEndResult = checkGameEnd(gameState);
        if (gameEndResult.isGameOver) {
            gameState.isGameActive = false;
            const finalScores = calculateFinalScores(gameState, gameEndResult.winner.id);
            
            return Result.Ok({
                message: `${gameEndResult.winner.username} has won the game!`,
                gameEnded: true,
                winner: gameEndResult.winner,
                scores: finalScores
            });
        }

        return Result.Ok({
            message: `Card played successfully.`,
            effect: effect.message,
            nextPlayer: gameState.getCurrentPlayer().username
        });
    },

    // Draw a card
    drawCard: async (gameId, playerId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        const currentPlayer = gameState.getCurrentPlayer();
        if (currentPlayer.id !== playerId) {
            return Result.Err('Not your turn');
        }

        // Simulate drawing a card
        const drawnCard = 'Green Reverse'; // In real implementation, would draw from deck

        gameState.addToHistory({
            player: currentPlayer.username,
            action: 'Drew a card'
        });

        gameState.advanceTurn();

        return Result.Ok({
            message: `${currentPlayer.username} drew a card from the deck.`,
            cardDrawn: drawnCard,
            nextPlayer: gameState.getCurrentPlayer().username
        });
    },

    // Declare UNO
    declareUno: (gameId, playerId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        const player = gameState.players.find(p => p.id === playerId);
        if (!player) {
            return Result.Err('Player not found');
        }

        gameState.declareUno(playerId);
        gameState.addToHistory({
            player: player.username,
            action: 'Said UNO'
        });

        return Result.Ok({
            message: `${player.username} said UNO successfully.`
        });
    },

    // Challenge UNO
    challengeUno: (gameId, challengerId, challengedId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        const challenger = gameState.players.find(p => p.id === challengerId);
        const challenged = gameState.players.find(p => p.id === challengedId);
        
        if (!challenger || !challenged) {
            return Result.Err('Player not found');
        }

        const challengeResult = handleUnoChallenge(challengerId, challengedId, gameState);
        
        gameState.addToHistory({
            player: challenger.username,
            action: `Challenged ${challenged.username} for not saying UNO`,
            result: challengeResult.success ? 'successful' : 'failed'
        });

        return Result.Ok({
            message: challengeResult.message,
            nextPlayer: gameState.getCurrentPlayer().username
        });
    },

    // Get game status
    getGameStatus: (gameId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        return Result.Ok(gameState.getGameStatus());
    },

    // Get player hand
    getPlayerHand: (gameId, playerId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        const player = gameState.players.find(p => p.id === playerId);
        if (!player) {
            return Result.Err('Player not found');
        }

        const hand = gameState.playerHands.get(playerId) || [];
        
        return Result.Ok({
            player: player.username,
            hand: hand.map(ph => `${ph.card.color} ${ph.card.value}`)
        });
    },

    // Get game history
    getGameHistory: (gameId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        return Result.Ok({
            history: gameState.gameHistory
        });
    },

    // Get scores
    getScores: (gameId) => {
        const gameState = gameStates.get(gameId);
        if (!gameState) {
            return Result.Err('Game not found');
        }

        return Result.Ok({
            scores: Object.fromEntries(gameState.scores)
        });
    }
};

export default gameRulesService;