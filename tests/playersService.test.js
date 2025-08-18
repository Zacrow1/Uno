import playerService from '../src/services/playerService.js';
import { Result } from '../src/utils/result.js';
import { Player } from '../src/orm/index.js';

const { createPlayer } = playerService;

// Mock the Player model
jest.mock('../src/orm/index.js', () => ({
  Player: {
    create: jest.fn()
  }
}));

describe('Player Service with Result Monad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crea jugador con datos válidos', async () => {
    const mockPlayerData = {
      id: 1,
      username: 'juan',
      email: 'juan@example.com',
      password: 'password123'
    };

    Player.create.mockResolvedValue({
      toJSON: () => mockPlayerData
    });

    const result = await createPlayer({ 
      username: '  juan  ', 
      email: 'JUAN@EXAMPLE.COM', 
      password: 'password123' 
    });

    expect(result.isOk).toBe(true);
    expect(result.value.username).toBe('juan');
    expect(result.value.email).toBe('juan@example.com');
    expect(Player.create).toHaveBeenCalledWith({
      username: 'juan',
      email: 'juan@example.com',
      password: 'password123'
    });
  });

  test('devuelve error por campos faltantes', async () => {
    const result = await createPlayer({ 
      username: 'juan', 
      password: 'password123' 
    });

    expect(result.isOk).toBe(false);
    expect(result.value).toBe('Missing fields: email');
  });

  test('devuelve error por múltiples campos faltantes', async () => {
    const result = await createPlayer({ 
      username: 'juan' 
    });

    expect(result.isOk).toBe(false);
    expect(result.value).toBe('Missing fields: email, password');
  });

  test('devuelve error por todos los campos faltantes', async () => {
    const result = await createPlayer({});

    expect(result.isOk).toBe(false);
    expect(result.value).toBe('Missing fields: username, email, password');
  });

  test('normaliza datos correctamente - espacios en username', async () => {
    const mockPlayerData = {
      id: 1,
      username: 'juan',
      email: 'juan@example.com',
      password: 'password123'
    };

    Player.create.mockResolvedValue({
      toJSON: () => mockPlayerData
    });

    const result = await createPlayer({ 
      username: '  juan  ', 
      email: 'juan@example.com', 
      password: 'password123' 
    });

    expect(result.isOk).toBe(true);
    expect(result.value.username).toBe('juan');
  });

  test('normaliza datos correctamente - email en minúsculas', async () => {
    const mockPlayerData = {
      id: 1,
      username: 'juan',
      email: 'juan@example.com',
      password: 'password123'
    };

    Player.create.mockResolvedValue({
      toJSON: () => mockPlayerData
    });

    const result = await createPlayer({ 
      username: 'juan', 
      email: 'JUAN@EXAMPLE.COM', 
      password: 'password123' 
    });

    expect(result.isOk).toBe(true);
    expect(result.value.email).toBe('juan@example.com');
  });

  test('maneja error de base de datos', async () => {
    const dbError = new Error('Database connection failed');
    Player.create.mockRejectedValue(dbError);

    const result = await createPlayer({ 
      username: 'juan', 
      email: 'juan@example.com', 
      password: 'password123' 
    });

    expect(result.isOk).toBe(false);
    expect(result.value).toBe('Database connection failed');
  });

  test('maneja datos vacíos', async () => {
    const result = await createPlayer({ 
      username: '', 
      email: '', 
      password: '' 
    });

    expect(result.isOk).toBe(false);
    expect(result.value).toBe('Missing fields: username, email, password');
  });

  test('maneja datos nulos', async () => {
    const result = await createPlayer({ 
      username: null, 
      email: null, 
      password: null 
    });

    expect(result.isOk).toBe(false);
    expect(result.value).toBe('Missing fields: username, email, password');
  });

  test('maneja datos undefined', async () => {
    const result = await createPlayer({});

    expect(result.isOk).toBe(false);
    expect(result.value).toBe('Missing fields: username, email, password');
  });
});