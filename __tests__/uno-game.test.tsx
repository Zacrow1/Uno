import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnoGame from '@/app/uno-game/page';
import { Socket } from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn()
  }))
}));

const mockIo = require('socket.io-client').io;

describe('UnoGame Component', () => {
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connect: jest.fn(),
      id: 'socket-1'
    } as any;

    mockIo.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render join game dialog initially', () => {
    render(<UnoGame />);

    expect(screen.getByText('Join UNO Game')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Join Game')).toBeInTheDocument();
  });

  test('should enable join button when name is entered and connected', () => {
    // Mock socket connected state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      }
    });

    render(<UnoGame />);

    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');

    // Initially disabled
    expect(joinButton).toBeDisabled();

    // Enter name
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });

    // Should be enabled now
    expect(joinButton).not.toBeDisabled();
  });

  test('should disable join button when not connected', () => {
    render(<UnoGame />);

    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');

    // Enter name
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });

    // Should still be disabled because not connected
    expect(joinButton).toBeDisabled();
  });

  test('should call joinGame when join button is clicked', async () => {
    // Mock socket connected state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      }
    });

    render(<UnoGame />);

    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');

    // Enter name
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });

    // Click join button
    fireEvent.click(joinButton);

    // Should emit joinGame event
    expect(mockSocket.emit).toHaveBeenCalledWith('joinGame', {
      playerName: 'Test Player'
    });
  });

  test('should display game board when game state is received', async () => {
    // Mock socket connected state and game state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameState') {
        callback({
          id: 'game-1',
          players: [
            { id: 'player-1', name: 'Test Player', hand: ['Red 5'], score: 0, saidUno: false }
          ],
          currentPlayerIndex: 0,
          direction: 'clockwise',
          topCard: 'Red 3',
          deck: [],
          discardPile: ['Red 3'],
          status: 'playing',
          turnHistory: []
        });
      }
    });

    render(<UnoGame />);

    // Join game
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Wait for game state to be processed
    await waitFor(() => {
      expect(screen.getByText('Game Info')).toBeInTheDocument();
      expect(screen.getByText('Your Hand (1 cards)')).toBeInTheDocument();
    });
  });

  test('should display player hand with cards', async () => {
    // Mock socket connected state and game state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameState') {
        callback({
          id: 'game-1',
          players: [
            { 
              id: 'player-1', 
              name: 'Test Player', 
              hand: ['Red 5', 'Blue 7', 'Green Skip'], 
              score: 0, 
              saidUno: false 
            }
          ],
          currentPlayerIndex: 0,
          direction: 'clockwise',
          topCard: 'Red 3',
          deck: [],
          discardPile: ['Red 3'],
          status: 'playing',
          turnHistory: []
        });
      }
    });

    render(<UnoGame />);

    // Join game
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Wait for game state to be processed
    await waitFor(() => {
      expect(screen.getByText('Your Hand (3 cards)')).toBeInTheDocument();
      expect(screen.getByText('Red 5')).toBeInTheDocument();
      expect(screen.getByText('Blue 7')).toBeInTheDocument();
      expect(screen.getByText('Green Skip')).toBeInTheDocument();
    });
  });

  test('should call playCard when card is clicked', async () => {
    // Mock socket connected state and game state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameState') {
        callback({
          id: 'game-1',
          players: [
            { 
              id: 'player-1', 
              name: 'Test Player', 
              hand: ['Red 5'], 
              score: 0, 
              saidUno: false 
            }
          ],
          currentPlayerIndex: 0,
          direction: 'clockwise',
          topCard: 'Red 3',
          deck: [],
          discardPile: ['Red 3'],
          status: 'playing',
          turnHistory: []
        });
      }
    });

    render(<UnoGame />);

    // Join game
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Wait for game state to be processed and card to appear
    await waitFor(() => {
      const cardButton = screen.getByText('Red 5');
      expect(cardButton).toBeInTheDocument();
      
      // Click card
      fireEvent.click(cardButton);
    });

    // Should emit playCard event
    expect(mockSocket.emit).toHaveBeenCalledWith('playCard', {
      playerName: 'Test Player',
      card: 'Red 5'
    });
  });

  test('should call drawCard when draw button is clicked', async () => {
    // Mock socket connected state and game state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameState') {
        callback({
          id: 'game-1',
          players: [
            { 
              id: 'player-1', 
              name: 'Test Player', 
              hand: ['Red 5'], 
              score: 0, 
              saidUno: false 
            }
          ],
          currentPlayerIndex: 0,
          direction: 'clockwise',
          topCard: 'Blue 7', // Different color to make card unplayable
          deck: ['Green 3'],
          discardPile: ['Blue 7'],
          status: 'playing',
          turnHistory: []
        });
      }
    });

    render(<UnoGame />);

    // Join game
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Wait for game state to be processed
    await waitFor(() => {
      const drawButton = screen.getByText('Draw Card');
      expect(drawButton).toBeInTheDocument();
      
      // Click draw button
      fireEvent.click(drawButton);
    });

    // Should emit drawCard event
    expect(mockSocket.emit).toHaveBeenCalledWith('drawCard', {
      playerName: 'Test Player'
    });
  });

  test('should show UNO button when player has one card', async () => {
    // Mock socket connected state and game state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameState') {
        callback({
          id: 'game-1',
          players: [
            { 
              id: 'player-1', 
              name: 'Test Player', 
              hand: ['Red 5'], 
              score: 0, 
              saidUno: false 
            }
          ],
          currentPlayerIndex: 0,
          direction: 'clockwise',
          topCard: 'Red 3',
          deck: [],
          discardPile: ['Red 3'],
          status: 'playing',
          turnHistory: []
        });
      }
    });

    render(<UnoGame />);

    // Join game
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Wait for game state to be processed
    await waitFor(() => {
      const unoButton = screen.getByText('Say UNO!');
      expect(unoButton).toBeInTheDocument();
      
      // Click UNO button
      fireEvent.click(unoButton);
    });

    // Should emit sayUno event
    expect(mockSocket.emit).toHaveBeenCalledWith('sayUno', {
      playerName: 'Test Player'
    });
  });

  test('should display game over screen when game is finished', async () => {
    // Mock socket connected state and game state
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameState') {
        callback({
          id: 'game-1',
          players: [
            { id: 'player-1', name: 'Test Player', hand: [], score: 0, saidUno: false },
            { id: 'player-2', name: 'Winner', hand: [], score: 0, saidUno: false }
          ],
          currentPlayerIndex: 0,
          direction: 'clockwise',
          topCard: 'Red 3',
          deck: [],
          discardPile: ['Red 3'],
          status: 'finished',
          winner: 'Winner',
          turnHistory: []
        });
      }
    });

    render(<UnoGame />);

    // Join game
    const nameInput = screen.getByPlaceholderText('Enter your name');
    const joinButton = screen.getByText('Join Game');
    
    fireEvent.change(nameInput, { target: { value: 'Test Player' } });
    fireEvent.click(joinButton);

    // Wait for game state to be processed
    await waitFor(() => {
      expect(screen.getByText('Game Over!')).toBeInTheDocument();
      expect(screen.getByText('🎉 Winner wins! 🎉')).toBeInTheDocument();
      expect(screen.getByText('Play Again')).toBeInTheDocument();
    });
  });

  test('should display connection status', () => {
    render(<UnoGame />);

    // Should show disconnected initially
    expect(screen.getByText('Disconnected')).toBeInTheDocument();

    // Simulate connection
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      }
    });

    render(<UnoGame />);

    // Should show connected
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  test('should display game messages', async () => {
    // Mock socket connected state and game message
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameMessage') {
        callback('Test message');
      }
    });

    render(<UnoGame />);

    // Wait for message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  test('should display game errors', async () => {
    // Mock socket connected state and game error
    mockSocket.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connect') {
        callback();
      } else if (event === 'gameError') {
        callback('Test error');
      }
    });

    render(<UnoGame />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });
});