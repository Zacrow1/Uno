'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Player {
  id: string;
  name: string;
  hand: string[];
  score: number;
  saidUno: boolean;
}

interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  direction: 'clockwise' | 'counterclockwise';
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

interface Card {
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string;
  display: string;
}

const UNO_CARDS: Card[] = [
  // Red cards
  ...[...Array(10)].map((_, i) => ({ color: 'red', value: i.toString(), display: `Red ${i}` })),
  ...['Skip', 'Reverse', 'Draw Two'].map(action => ({ color: 'red', value: action, display: `Red ${action}` })),
  
  // Blue cards
  ...[...Array(10)].map((_, i) => ({ color: 'blue', value: i.toString(), display: `Blue ${i}` })),
  ...['Skip', 'Reverse', 'Draw Two'].map(action => ({ color: 'blue', value: action, display: `Blue ${action}` })),
  
  // Green cards
  ...[...Array(10)].map((_, i) => ({ color: 'green', value: i.toString(), display: `Green ${i}` })),
  ...['Skip', 'Reverse', 'Draw Two'].map(action => ({ color: 'green', value: action, display: `Green ${action}` })),
  
  // Yellow cards
  ...[...Array(10)].map((_, i) => ({ color: 'yellow', value: i.toString(), display: `Yellow ${i}` })),
  ...['Skip', 'Reverse', 'Draw Two'].map(action => ({ color: 'yellow', value: action, display: `Yellow ${action}` })),
  
  // Wild cards
  { color: 'wild', value: 'Wild', display: 'Wild' },
  { color: 'wild', value: 'Wild Draw Four', display: 'Wild Draw Four' },
];

export default function UnoGame() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socketio',
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socketInstance.on('gameState', (state: GameState) => {
      setGameState(state);
      const player = state.players.find(p => p.name === playerName);
      setCurrentPlayer(player || null);
    });

    socketInstance.on('gameMessage', (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(''), 3000);
    });

    socketInstance.on('gameError', (err: string) => {
      setError(err);
      setTimeout(() => setError(''), 5000);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [playerName]);

  const joinGame = async () => {
    if (!playerName.trim() || !socket) return;
    
    setIsJoining(true);
    try {
      socket.emit('joinGame', { playerName: playerName.trim() });
    } catch (err) {
      setError('Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('startGame');
  };

  const playCard = (card: string) => {
    if (!socket || !currentPlayer) return;
    socket.emit('playCard', { playerName: currentPlayer.name, card });
  };

  const drawCard = () => {
    if (!socket || !currentPlayer) return;
    socket.emit('drawCard', { playerName: currentPlayer.name });
  };

  const sayUno = () => {
    if (!socket || !currentPlayer) return;
    socket.emit('sayUno', { playerName: currentPlayer.name });
  };

  const challengeUno = (challengedPlayer: string) => {
    if (!socket || !currentPlayer) return;
    socket.emit('challengeUno', { 
      challenger: currentPlayer.name, 
      challengedPlayer 
    });
  };

  const getCardColor = (card: string) => {
    if (card.includes('Red')) return 'bg-red-500 text-white';
    if (card.includes('Blue')) return 'bg-blue-500 text-white';
    if (card.includes('Green')) return 'bg-green-500 text-white';
    if (card.includes('Yellow')) return 'bg-yellow-500 text-black';
    if (card.includes('Wild')) return 'bg-gray-800 text-white';
    return 'bg-gray-200 text-black';
  };

  const canPlayCard = (card: string) => {
    if (!gameState || !currentPlayer) return false;
    if (gameState.currentPlayerIndex !== gameState.players.findIndex(p => p.name === currentPlayer.name)) {
      return false;
    }
    
    // Simple validation - can be enhanced with actual UNO rules
    const topCard = gameState.topCard;
    return card.includes(topCard.split(' ')[0]) || // Same color
           card.includes(topCard.split(' ')[1]) || // Same number/action
           card.includes('Wild'); // Wild cards can always be played
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">UNO Game</h1>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {gameState && (
              <Badge variant="outline">
                {gameState.status === 'waiting' ? 'Waiting for players' : 
                 gameState.status === 'playing' ? 'Game in progress' : 'Game finished'}
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Join Game Dialog */}
        {!currentPlayer && (
          <Dialog open={!currentPlayer}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join UNO Game</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && joinGame()}
                />
                <Button 
                  onClick={joinGame} 
                  disabled={!playerName.trim() || isJoining || !isConnected}
                  className="w-full"
                >
                  {isJoining ? 'Joining...' : 'Join Game'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Game Board */}
        {gameState && currentPlayer && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Info Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">Current Player:</p>
                    <p>{gameState.players[gameState.currentPlayerIndex]?.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Direction:</p>
                    <p>{gameState.direction}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Top Card:</p>
                    <Badge className={getCardColor(gameState.topCard)}>
                      {gameState.topCard}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Cards in Deck:</p>
                    <p>{gameState.deck.length}</p>
                  </div>
                  {gameState.status === 'waiting' && gameState.players.length >= 2 && (
                    <Button onClick={startGame} className="w-full">
                      Start Game
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Players List */}
              <Card>
                <CardHeader>
                  <CardTitle>Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gameState.players.map((player, index) => (
                      <div 
                        key={player.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          index === gameState.currentPlayerIndex ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div>
                          <span className="font-medium">{player.name}</span>
                          {player.saidUno && <Badge className="ml-2">UNO!</Badge>}
                        </div>
                        <div className="text-sm text-gray-600">
                          {player.hand.length} cards
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Player Hand */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Hand ({currentPlayer.hand.length} cards)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48 w-full">
                    <div className="flex flex-wrap gap-2">
                      {currentPlayer.hand.map((card, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`h-16 w-24 ${getCardColor(card)} ${
                            canPlayCard(card) ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                          }`}
                          onClick={() => canPlayCard(card) && playCard(card)}
                          disabled={!canPlayCard(card)}
                        >
                          <span className="text-xs font-medium">{card}</span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={drawCard}
                      disabled={gameState.currentPlayerIndex !== gameState.players.findIndex(p => p.name === currentPlayer.name)}
                    >
                      Draw Card
                    </Button>
                    
                    {currentPlayer.hand.length === 1 && !currentPlayer.saidUno && (
                      <Button onClick={sayUno} variant="outline">
                        Say UNO!
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Game History */}
              <Card>
                <CardHeader>
                  <CardTitle>Game History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32 w-full">
                    <div className="space-y-1">
                      {gameState.turnHistory.slice(-10).map((turn, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">{turn.player}:</span> {turn.action}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Challenge Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Challenge UNO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Challenge players who forgot to say UNO when they had one card left.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gameState.players
                        .filter(p => p.name !== currentPlayer.name && p.hand.length === 1 && !p.saidUno)
                        .map(player => (
                          <Button
                            key={player.id}
                            variant="outline"
                            size="sm"
                            onClick={() => challengeUno(player.name)}
                          >
                            Challenge {player.name}
                          </Button>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameState?.status === 'finished' && gameState.winner && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Game Over!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-xl font-semibold">🎉 {gameState.winner} wins! 🎉</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gameState.players.map(player => (
                    <div key={player.id} className="text-center">
                      <p className="font-medium">{player.name}</p>
                      <p className="text-2xl font-bold text-blue-600">{player.score}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={() => window.location.reload()}>
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}