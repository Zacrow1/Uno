import gameRulesService from '../services/gameRulesService.js';
import { Game, Player } from '../orm/index.js';

// Deal cards to players
export const dealCards = async (req, res) => {
    try {
        const { players, cardsPerPlayer = 7 } = req.body;
        
        if (!players || !Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ 
                message: 'Players array is required and cannot be empty' 
            });
        }

        if (cardsPerPlayer < 1 || cardsPerPlayer > 10) {
            return res.status(400).json({ 
                message: 'Cards per player must be between 1 and 10' 
            });
        }

        // Get player objects from usernames
        const playerObjects = await Player.findAll({
            where: { username: players }
        });

        if (playerObjects.length !== players.length) {
            return res.status(400).json({ 
                message: 'One or more players not found' 
            });
        }

        // Create a new game for this session
        const game = await Game.create({
            name: `UNO Game ${Date.now()}`,
            status: 'active'
        });

        // Initialize game state
        const gameStateResult = gameRulesService.initializeGame(game.id, playerObjects);
        
        if (!gameStateResult.isOk) {
            return res.status(400).json({ message: gameStateResult.value });
        }

        // Deal cards
        const dealResult = await gameRulesService.dealCards(game.id, playerObjects, cardsPerPlayer);
        
        if (!dealResult.isOk) {
            return res.status(400).json({ message: dealResult.value });
        }

        res.json(dealResult.value);
    } catch (error) {
        console.error('Error dealing cards:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Play a card
export const playCard = async (req, res) => {
    try {
        const { gameId, player, cardPlayed } = req.body;
        
        if (!gameId || !player || !cardPlayed) {
            return res.status(400).json({ 
                message: 'Game ID, player, and card played are required' 
            });
        }

        // Get player ID from username
        const playerObj = await Player.findOne({ where: { username: player } });
        if (!playerObj) {
            return res.status(400).json({ message: 'Player not found' });
        }

        const result = await gameRulesService.playCard(gameId, playerObj.id, cardPlayed);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error playing card:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Draw a card
export const drawCard = async (req, res) => {
    try {
        const { gameId, player } = req.body;
        
        if (!gameId || !player) {
            return res.status(400).json({ 
                message: 'Game ID and player are required' 
            });
        }

        // Get player ID from username
        const playerObj = await Player.findOne({ where: { username: player } });
        if (!playerObj) {
            return res.status(400).json({ message: 'Player not found' });
        }

        const result = await gameRulesService.drawCard(gameId, playerObj.id);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error drawing card:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Declare UNO
export const declareUno = async (req, res) => {
    try {
        const { gameId, player } = req.body;
        
        if (!gameId || !player) {
            return res.status(400).json({ 
                message: 'Game ID and player are required' 
            });
        }

        // Get player ID from username
        const playerObj = await Player.findOne({ where: { username: player } });
        if (!playerObj) {
            return res.status(400).json({ message: 'Player not found' });
        }

        const result = gameRulesService.declareUno(gameId, playerObj.id);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error declaring UNO:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Challenge UNO
export const challengeUno = async (req, res) => {
    try {
        const { gameId, challenger, challengedPlayer } = req.body;
        
        if (!gameId || !challenger || !challengedPlayer) {
            return res.status(400).json({ 
                message: 'Game ID, challenger, and challenged player are required' 
            });
        }

        // Get player IDs from usernames
        const challengerObj = await Player.findOne({ where: { username: challenger } });
        const challengedObj = await Player.findOne({ where: { username: challengedPlayer } });
        
        if (!challengerObj || !challengedObj) {
            return res.status(400).json({ message: 'One or more players not found' });
        }

        const result = gameRulesService.challengeUno(gameId, challengerObj.id, challengedObj.id);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error challenging UNO:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get game status
export const getGameStatus = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        if (!gameId) {
            return res.status(400).json({ message: 'Game ID is required' });
        }

        const result = gameRulesService.getGameStatus(gameId);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error getting game status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get player hand
export const getPlayerHand = async (req, res) => {
    try {
        const { gameId, player } = req.query;
        
        if (!gameId || !player) {
            return res.status(400).json({ 
                message: 'Game ID and player are required' 
            });
        }

        // Get player ID from username
        const playerObj = await Player.findOne({ where: { username: player } });
        if (!playerObj) {
            return res.status(400).json({ message: 'Player not found' });
        }

        const result = gameRulesService.getPlayerHand(gameId, playerObj.id);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error getting player hand:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get game history
export const getGameHistory = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        if (!gameId) {
            return res.status(400).json({ message: 'Game ID is required' });
        }

        const result = gameRulesService.getGameHistory(gameId);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error getting game history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get scores
export const getScores = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        if (!gameId) {
            return res.status(400).json({ message: 'Game ID is required' });
        }

        const result = gameRulesService.getScores(gameId);
        
        if (!result.isOk) {
            return res.status(400).json({ message: result.value });
        }

        res.json(result.value);
    } catch (error) {
        console.error('Error getting scores:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle player turns (next turn)
export const nextTurn = async (req, res) => {
    try {
        const { players, currentPlayerIndex } = req.body;
        
        if (!players || !Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ 
                message: 'Players array is required and cannot be empty' 
            });
        }

        if (currentPlayerIndex === undefined || currentPlayerIndex < 0 || currentPlayerIndex >= players.length) {
            return res.status(400).json({ 
                message: 'Valid current player index is required' 
            });
        }

        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        
        res.json({
            nextPlayerIndex,
            nextPlayer: players[nextPlayerIndex]
        });
    } catch (error) {
        console.error('Error getting next turn:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle skip card
export const handleSkipCard = async (req, res) => {
    try {
        const { cardPlayed, currentPlayerIndex, players, direction } = req.body;
        
        if (cardPlayed !== 'skip') {
            return res.status(400).json({ 
                message: 'Card played must be a skip card' 
            });
        }

        if (!players || !Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ 
                message: 'Players array is required and cannot be empty' 
            });
        }

        if (currentPlayerIndex === undefined || currentPlayerIndex < 0 || currentPlayerIndex >= players.length) {
            return res.status(400).json({ 
                message: 'Valid current player index is required' 
            });
        }

        // Calculate next player (skip one player)
        const nextPlayerIndex = (currentPlayerIndex + 2) % players.length;
        const skippedPlayerIndex = (currentPlayerIndex + 1) % players.length;
        
        res.json({
            nextPlayerIndex,
            nextPlayer: players[nextPlayerIndex],
            skippedPlayer: players[skippedPlayerIndex]
        });
    } catch (error) {
        console.error('Error handling skip card:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle reverse card
export const handleReverseCard = async (req, res) => {
    try {
        const { cardPlayed, currentPlayerIndex, players, direction } = req.body;
        
        if (cardPlayed !== 'reverse') {
            return res.status(400).json({ 
                message: 'Card played must be a reverse card' 
            });
        }

        if (!players || !Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ 
                message: 'Players array is required and cannot be empty' 
            });
        }

        if (currentPlayerIndex === undefined || currentPlayerIndex < 0 || currentPlayerIndex >= players.length) {
            return res.status(400).json({ 
                message: 'Valid current player index is required' 
            });
        }

        // Reverse direction
        const newDirection = direction === 'clockwise' ? 'counterclockwise' : 'clockwise';
        
        // Calculate next player based on new direction
        let nextPlayerIndex;
        if (newDirection === 'clockwise') {
            nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        } else {
            nextPlayerIndex = currentPlayerIndex === 0 ? players.length - 1 : currentPlayerIndex - 1;
        }
        
        res.json({
            newDirection,
            nextPlayerIndex,
            nextPlayer: players[nextPlayerIndex]
        });
    } catch (error) {
        console.error('Error handling reverse card:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle drawing cards when can't play
export const handleDrawCard = async (req, res) => {
    try {
        const { playerHand, deck, currentCard } = req.body;
        
        if (!playerHand || !Array.isArray(playerHand)) {
            return res.status(400).json({ 
                message: 'Player hand array is required' 
            });
        }

        if (!deck || !Array.isArray(deck)) {
            return res.status(400).json({ 
                message: 'Deck array is required' 
            });
        }

        if (!currentCard) {
            return res.status(400).json({ 
                message: 'Current card is required' 
            });
        }

        // Check if player has playable cards
        const hasPlayableCard = playerHand.some(card => {
            return card.includes(currentCard.split(' ')[0]) || // Match color
                   card.includes(currentCard.split(' ')[1]);   // Match value
        });

        if (hasPlayableCard) {
            return res.status(400).json({ 
                message: 'Player has playable cards and must play one' 
            });
        }

        // Draw a card from deck
        if (deck.length === 0) {
            return res.status(400).json({ 
                message: 'No cards left in deck' 
            });
        }

        const drawnCard = deck[0];
        const newDeck = deck.slice(1);
        const newHand = [...playerHand, drawnCard];

        // Check if drawn card is playable
        const isDrawnCardPlayable = drawnCard.includes(currentCard.split(' ')[0]) || 
                                   drawnCard.includes(currentCard.split(' ')[1]);

        res.json({
            newHand,
            drawnCard,
            playable: isDrawnCardPlayable,
            remainingDeck: newDeck
        });
    } catch (error) {
        console.error('Error handling draw card:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    dealCards,
    playCard,
    drawCard,
    declareUno,
    challengeUno,
    getGameStatus,
    getPlayerHand,
    getGameHistory,
    getScores,
    nextTurn,
    handleSkipCard,
    handleReverseCard,
    handleDrawCard
};