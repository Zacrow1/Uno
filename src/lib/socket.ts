import { Server } from 'socket.io';

interface UnoGameState {
  id: string;
  players: Array<{
    id: string;
    name: string;
    hand: string[];
    score: number;
    saidUno: boolean;
  }>;
  currentPlayerIndex: number;
  topCard: string;
  deck: string[];
  discardPile: string[];
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  turnHistory: Array<{
    player: string;
    action: string;
    timestamp: string;
  }>;
}

// Store active games in memory (in production, use Redis or similar)
const activeGames = new Map<string, UnoGameState>();
const playerSockets = new Map<string, string>(); // playerId -> socketId

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle joining a game
    socket.on('joinGame', async (data: { playerName: string }) => {
      try {
        const { playerName } = data;
        
        // Find or create a waiting game
        let game = Array.from(activeGames.values()).find(g => g.status === 'waiting' && g.players.length < 4);
        
        if (!game) {
          // Create new game
          const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          game = {
            id: gameId,
            players: [],
            currentPlayerIndex: 0,
            topCard: '',
            deck: [],
            discardPile: [],
            status: 'waiting',
            turnHistory: []
          };
          activeGames.set(gameId, game);
        }

        // Add player to game
        const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const player = {
          id: playerId,
          name: playerName,
          hand: [],
          score: 0,
          saidUno: false
        };

        game.players.push(player);
        playerSockets.set(playerId, socket.id);
        
        // Join socket to game room
        socket.join(game.id);
        
        // Send game state to all players in the game
        io.to(game.id).emit('gameState', game);
        
        // Send confirmation to the player
        socket.emit('gameMessage', `${playerName} joined the game!`);
        
        console.log(`Player ${playerName} joined game ${game.id}`);
      } catch (error) {
        socket.emit('gameError', 'Failed to join game');
        console.error('Error joining game:', error);
      }
    });

    // Handle starting a game
    socket.on('startGame', async () => {
      try {
        // Find the game this socket is in
        const gameId = Array.from(socket.rooms).find(room => room.startsWith('game_'));
        if (!gameId) {
          socket.emit('gameError', 'Not in a game');
          return;
        }

        const game = activeGames.get(gameId);
        if (!game || game.status !== 'waiting') {
          socket.emit('gameError', 'Game cannot be started');
          return;
        }

        if (game.players.length < 2) {
          socket.emit('gameError', 'Need at least 2 players to start');
          return;
        }

        // Generate deck and deal cards
        const deck = generateDeck();
        shuffleArray(deck);
        
        // Deal 7 cards to each player
        game.players.forEach(player => {
          player.hand = deck.splice(0, 7);
        });
        
        // Put first card on discard pile
        const firstCard = deck.pop();
        if (firstCard) {
          game.discardPile.push(firstCard);
          game.topCard = firstCard;
        }
        
        game.deck = deck;
        game.status = 'playing';
        game.turnHistory.push({
          player: 'System',
          action: 'Game started',
          timestamp: new Date().toISOString()
        });

        // Notify all players
        io.to(gameId).emit('gameState', game);
        io.to(gameId).emit('gameMessage', 'Game started!');
        
        console.log(`Game ${gameId} started with ${game.players.length} players`);
      } catch (error) {
        socket.emit('gameError', 'Failed to start game');
        console.error('Error starting game:', error);
      }
    });

    // Handle playing a card
    socket.on('playCard', async (data: { playerName: string; card: string }) => {
      try {
        const { playerName, card } = data;
        const gameId = Array.from(socket.rooms).find(room => room.startsWith('game_'));
        
        if (!gameId) {
          socket.emit('gameError', 'Not in a game');
          return;
        }

        const game = activeGames.get(gameId);
        if (!game || game.status !== 'playing') {
          socket.emit('gameError', 'Game is not in progress');
          return;
        }

        const currentPlayer = game.players[game.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.name !== playerName) {
          socket.emit('gameError', 'Not your turn');
          return;
        }

        // Check if player has the card
        const cardIndex = currentPlayer.hand.indexOf(card);
        if (cardIndex === -1) {
          socket.emit('gameError', 'Card not found in your hand');
          return;
        }

        // Validate card play (simplified)
        if (!isValidPlay(card, game.topCard)) {
          socket.emit('gameError', 'Invalid card play');
          return;
        }

        // Play the card
        currentPlayer.hand.splice(cardIndex, 1);
        game.discardPile.push(card);
        game.topCard = card;

        // Add to turn history
        game.turnHistory.push({
          player: playerName,
          action: `Played ${card}`,
          timestamp: new Date().toISOString()
        });

        // Check for win
        if (currentPlayer.hand.length === 0) {
          game.status = 'finished';
          game.winner = playerName;
          io.to(gameId).emit('gameState', game);
          io.to(gameId).emit('gameMessage', `${playerName} wins the game!`);
          return;
        }

        // Check for UNO
        if (currentPlayer.hand.length === 1 && !currentPlayer.saidUno) {
          // Player forgot to say UNO, draw 2 cards as penalty
          const cardsToDraw = game.deck.splice(0, 2);
          currentPlayer.hand.push(...cardsToDraw);
          io.to(gameId).emit('gameMessage', `${playerName} forgot to say UNO! Drew 2 cards.`);
        }

        // Move to next player (simple clockwise only for Week 6)
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        
        // Notify all players
        io.to(gameId).emit('gameState', game);
        io.to(gameId).emit('gameMessage', `${playerName} played ${card}`);
        
        console.log(`Player ${playerName} played card ${card} in game ${gameId}`);
      } catch (error) {
        socket.emit('gameError', 'Failed to play card');
        console.error('Error playing card:', error);
      }
    });

    // Handle drawing a card
    socket.on('drawCard', async (data: { playerName: string }) => {
      try {
        const { playerName } = data;
        const gameId = Array.from(socket.rooms).find(room => room.startsWith('game_'));
        
        if (!gameId) {
          socket.emit('gameError', 'Not in a game');
          return;
        }

        const game = activeGames.get(gameId);
        if (!game || game.status !== 'playing') {
          socket.emit('gameError', 'Game is not in progress');
          return;
        }

        const currentPlayer = game.players[game.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.name !== playerName) {
          socket.emit('gameError', 'Not your turn');
          return;
        }

        if (game.deck.length === 0) {
          socket.emit('gameError', 'No cards left in deck');
          return;
        }

        // Draw a card
        const drawnCard = game.deck.pop();
        if (drawnCard) {
          currentPlayer.hand.push(drawnCard);
          
          // Add to turn history
          game.turnHistory.push({
            player: playerName,
            action: 'Drew a card',
            timestamp: new Date().toISOString()
          });

          // Move to next player (simple clockwise only for Week 6)
          game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
          
          // Notify all players
          io.to(gameId).emit('gameState', game);
          io.to(gameId).emit('gameMessage', `${playerName} drew a card`);
          
          console.log(`Player ${playerName} drew a card in game ${gameId}`);
        }
      } catch (error) {
        socket.emit('gameError', 'Failed to draw card');
        console.error('Error drawing card:', error);
      }
    });

    // Handle saying UNO
    socket.on('sayUno', async (data: { playerName: string }) => {
      try {
        const { playerName } = data;
        const gameId = Array.from(socket.rooms).find(room => room.startsWith('game_'));
        
        if (!gameId) {
          socket.emit('gameError', 'Not in a game');
          return;
        }

        const game = activeGames.get(gameId);
        if (!game) {
          socket.emit('gameError', 'Game not found');
          return;
        }

        const player = game.players.find(p => p.name === playerName);
        if (!player) {
          socket.emit('gameError', 'Player not found');
          return;
        }

        if (player.hand.length !== 1) {
          socket.emit('gameError', 'You can only say UNO when you have one card');
          return;
        }

        player.saidUno = true;
        
        // Add to turn history
        game.turnHistory.push({
          player: playerName,
          action: 'Said UNO!',
          timestamp: new Date().toISOString()
        });

        // Notify all players
        io.to(gameId).emit('gameState', game);
        io.to(gameId).emit('gameMessage', `${playerName} said UNO!`);
        
        console.log(`Player ${playerName} said UNO in game ${gameId}`);
      } catch (error) {
        socket.emit('gameError', 'Failed to say UNO');
        console.error('Error saying UNO:', error);
      }
    });

    // Handle challenging UNO
    socket.on('challengeUno', async (data: { challenger: string; challengedPlayer: string }) => {
      try {
        const { challenger, challengedPlayer } = data;
        const gameId = Array.from(socket.rooms).find(room => room.startsWith('game_'));
        
        if (!gameId) {
          socket.emit('gameError', 'Not in a game');
          return;
        }

        const game = activeGames.get(gameId);
        if (!game) {
          socket.emit('gameError', 'Game not found');
          return;
        }

        const challenged = game.players.find(p => p.name === challengedPlayer);
        if (!challenged) {
          socket.emit('gameError', 'Challenged player not found');
          return;
        }

        if (challenged.hand.length !== 1) {
          socket.emit('gameError', 'Can only challenge players with one card');
          return;
        }

        if (challenged.saidUno) {
          // Challenge failed
          io.to(gameId).emit('gameMessage', `${challenger}'s challenge failed! ${challengedPlayer} said UNO on time.`);
        } else {
          // Challenge successful - challenged player draws 2 cards
          const cardsToDraw = game.deck.splice(0, 2);
          challenged.hand.push(...cardsToDraw);
          
          // Add to turn history
          game.turnHistory.push({
            player: 'System',
            action: `${challengedPlayer} was challenged and drew 2 cards`,
            timestamp: new Date().toISOString()
          });

          io.to(gameId).emit('gameMessage', `${challenger}'s challenge successful! ${challengedPlayer} forgot to say UNO and drew 2 cards.`);
        }

        // Notify all players
        io.to(gameId).emit('gameState', game);
        
        console.log(`Player ${challenger} challenged ${challengedPlayer} in game ${gameId}`);
      } catch (error) {
        socket.emit('gameError', 'Failed to challenge UNO');
        console.error('Error challenging UNO:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove player from active games
      for (const [playerId, socketId] of playerSockets.entries()) {
        if (socketId === socket.id) {
          playerSockets.delete(playerId);
          
          // Find and remove player from game
          for (const [gameId, game] of activeGames.entries()) {
            const playerIndex = game.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
              const playerName = game.players[playerIndex].name;
              game.players.splice(playerIndex, 1);
              
              // Notify remaining players
              io.to(gameId).emit('gameMessage', `${playerName} left the game`);
              io.to(gameId).emit('gameState', game);
              
              // Remove game if no players left
              if (game.players.length === 0) {
                activeGames.delete(gameId);
              }
              
              break;
            }
          }
          
          break;
        }
      }
    });

    // Send welcome message
    socket.emit('gameMessage', 'Welcome to UNO Game!');
  });
};

// Helper functions
function generateDeck(): string[] {
  const deck: string[] = [];
  const colors = ['red', 'blue', 'green', 'yellow'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  // Add colored cards
  colors.forEach(color => {
    values.forEach(value => {
      deck.push(`${color} ${value}`);
      
      // Add second copy for non-zero cards
      if (value !== '0') {
        deck.push(`${color} ${value}`);
      }
    });
  });
  
  return deck;
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function isValidPlay(card: string, topCard: string): boolean {
  if (!topCard) return true;
  
  // Check color match
  const cardColor = card.split(' ')[0];
  const topColor = topCard.split(' ')[0];
  if (cardColor === topColor) return true;
  
  // Check value match
  const cardValue = card.split(' ').slice(1).join(' ');
  const topValue = topCard.split(' ').slice(1).join(' ');
  if (cardValue === topValue) return true;
  
  return false;
}