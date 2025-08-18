import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import cardsRoutes from './routes/cardsRoutes.js';
import gamesRoutes from './routes/gamesRoutes.js';
import gameRulesRoutes from './routes/gameRulesRoutes.js';
import playerCardRoutes from './routes/playerCardRoutes.js';
import playersRoutes from './routes/playersRoutes.js';
import scoresRoutes from './routes/scoresRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/players', playersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api', playerCardRoutes);
app.use('/api/game', gameRulesRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start the server if this file is run directly
if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;

