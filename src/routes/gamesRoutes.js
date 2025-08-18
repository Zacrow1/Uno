import express from 'express';
import gamesController from '../controllers/gamesController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, gamesController.createGame);
router.get('/:id', authMiddleware, gamesController.getGame);
router.put('/:id', authMiddleware, gamesController.updateGame);
router.delete('/:id', authMiddleware, gamesController.deleteGame);
router.get('/', authMiddleware, gamesController.listGames);
router.post('/:id/join', authMiddleware, gamesController.joinGame);
router.post('/:id/start', authMiddleware, gamesController.startGame);
router.post('/:id/leave', authMiddleware, gamesController.leaveGame);
router.post('/:id/end', authMiddleware, gamesController.endGame);
router.get('/:id/state', authMiddleware, gamesController.getGameState);
router.get('/:id/players', authMiddleware, gamesController.getPlayersInGame);
router.get('/:id/current-player', authMiddleware, gamesController.getCurrentPlayer);
router.get('/:id/top-card', authMiddleware, gamesController.getTopCard);
router.get('/:id/scores', authMiddleware, gamesController.getGameScores);

export default router;