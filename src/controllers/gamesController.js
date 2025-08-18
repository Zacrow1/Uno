import gameService from '../services/gameService.js';

// Crear un nuevo juego
const createGame = async (req, res) => {
  try {
    const gameData = {
      ...req.body,
      creatorId: req.user.id
    };
    const game = await gameService.createGame(gameData);
    res.status(201).json(game);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al crear juego' });
  }
};

// Obtener un juego por ID
const getGame = async (req, res) => {
  try {
    const game = await gameService.getGameById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al obtener juego' });
  }
};

// Actualizar un juego
const updateGame = async (req, res) => {
  try {
    const updated = await gameService.updateGame(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al actualizar juego' });
  }
};

// Eliminar un juego
const deleteGame = async (req, res) => {
  try {
    const deleted = await gameService.deleteGame(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json({ message: 'Juego eliminado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: 'Error interno al eliminar juego' });
  }
};

// Listar todos los juegos
const listGames = async (req, res) => {
  try {
    const games = await gameService.listGames();
    res.json(games);
  } catch (e) {
    res.status(500).json({ error: 'Error interno al listar juegos' });
  }
};

// Unirse a un juego
const joinGame = async (req, res) => {
  const gameId = req.params.id;
  const playerId = req.user.id;
  try {
    const result = await gameService.addPlayerToGame(gameId, playerId);
    if (result === 'already_joined') {
      return res.status(409).json({ error: 'El usuario ya está en el juego' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    return res.json({ message: 'Usuario unido al juego exitosamente' });
  } catch (e) {
    return res.status(500).json({ error: 'Error al unirse al juego' });
  }
};

// Iniciar un juego
const startGame = async (req, res) => {
  const gameId = req.params.id;
  const userId = req.user.id;
  try {
    const result = await gameService.startGame(gameId, userId);
    if (result === 'not_creator') {
      return res.status(403).json({ error: 'Solo el creador puede iniciar el juego' });
    }
    if (result === 'no_players') {
      return res.status(400).json({ error: 'No hay jugadores en el juego' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    return res.json({ message: 'Juego iniciado exitosamente' });
  } catch (e) {
    return res.status(500).json({ error: 'Error al iniciar el juego' });
  }
};

// Salir de un juego
const leaveGame = async (req, res) => {
  const gameId = req.params.id;
  const playerId = req.user.id;
  try {
    const result = await gameService.removePlayerFromGame(gameId, playerId);
    if (result === 'not_in_game') {
      return res.status(404).json({ error: 'El usuario no está en el juego' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    return res.json({ message: 'Usuario salió del juego exitosamente' });
  } catch (e) {
    return res.status(500).json({ error: 'Error al salir del juego' });
  }
};

// Finalizar un juego
const endGame = async (req, res) => {
  const gameId = req.params.id;
  const userId = req.user.id;
  try {
    const result = await gameService.endGame(gameId, userId);
    if (result === 'not_creator') {
      return res.status(403).json({ error: 'Solo el creador puede finalizar el juego' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    return res.json({ message: 'Juego finalizado exitosamente' });
  } catch (e) {
    return res.status(500).json({ error: 'Error al finalizar el juego' });
  }
};

// Obtener el estado de un juego
const getGameState = async (req, res) => {
  const gameId = req.params.id;
  try {
    const game = await gameService.getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    return res.json({ game_id: game.id, state: game.status });
  } catch (e) {
    return res.status(500).json({ error: 'Error al obtener el estado del juego' });
  }
};

// Obtener los jugadores de un juego
const getPlayersInGame = async (req, res) => {
  const gameId = req.params.id;
  try {
    const players = await gameService.getPlayersInGame(gameId);
    return res.json({ game_id: gameId, players: players.map(p => p.username) });
  } catch (e) {
    return res.status(500).json({ error: 'Error al obtener los jugadores del juego' });
  }
};

// Obtener el jugador actual
const getCurrentPlayer = async (req, res) => {
  const gameId = req.params.id;
  try {
    const players = await gameService.getPlayersInGame(gameId);
    if (!players || players.length === 0) {
      return res.status(404).json({ error: 'No hay jugadores en el juego' });
    }
    // Simulación: el primer jugador es el actual
    return res.json({ game_id: gameId, current_player: players[0].username });
  } catch (e) {
    return res.status(500).json({ error: 'Error al obtener el jugador actual' });
  }
};

// Obtener la carta superior
const getTopCard = async (req, res) => {
  const gameId = req.params.id;
  try {
    // Simulación: devolver carta fija
    return res.json({ game_id: gameId, top_card: 'Red 5' });
  } catch (e) {
    return res.status(500).json({ error: 'Error al obtener la carta superior' });
  }
};

// Obtener los puntajes del juego
const getGameScores = async (req, res) => {
  const gameId = req.params.id;
  try {
    const players = await gameService.getPlayersInGame(gameId);
    if (!players || players.length === 0) {
      return res.status(404).json({ error: 'No hay jugadores en el juego' });
    }
    // Simulación: asignar puntaje aleatorio
    const scores = {};
    players.forEach(p => { scores[p.username] = Math.floor(Math.random() * 200); });
    return res.json({ game_id: gameId, scores });
  } catch (e) {
    return res.status(500).json({ error: 'Error al obtener los puntajes del juego' });
  }
};

export default { createGame, getGame, updateGame, deleteGame, listGames, joinGame, startGame, leaveGame, endGame, getGameState, getPlayersInGame, getCurrentPlayer, getTopCard, getGameScores };