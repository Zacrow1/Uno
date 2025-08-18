import express from 'express';
import {
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
} from '../controllers/gameRulesController.js';

const router = express.Router();

// Deal cards to players
router.post('/deal', dealCards);

// Play a card
router.put('/play', playCard);

// Draw a card
router.put('/draw', drawCard);

// Declare UNO
router.patch('/uno', declareUno);

// Challenge UNO
router.post('/challenge', challengeUno);

// Get game status
router.get('/status/:gameId', getGameStatus);

// Get player hand
router.get('/hand', getPlayerHand);

// Get game history
router.get('/history/:gameId', getGameHistory);

// Get scores
router.get('/scores/:gameId', getScores);

// Handle player turns
router.post('/nextTurn', nextTurn);

// Handle skip card
router.post('/skip', handleSkipCard);

// Handle reverse card
router.post('/reverse', handleReverseCard);

// Handle drawing cards when can't play
router.post('/drawCard', handleDrawCard);

export default router;