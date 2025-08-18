import { Game, Player } from "../orm/index.js";
import functional from "../utils/functional.js";
import cardService from "./cardService.js";
import playerCardService from "./playerCardService.js";
const { map, identity } = functional;

// Crear un nuevo juego
const createGame = async (data) => {
  return await Game.create({
    name: data.name,
    status: "waiting",
    creatorId: data.creatorId,
  });
};

// Obtener juego por ID
const getGameById = async (id) => {
  return await Game.findByPk(id);
};

// Actualizar juego
const updateGame = async (id, data) => {
  const game = await Game.findByPk(id);
  if (!game) return null;
  return await game.update(data);
};

// Eliminar juego
const deleteGame = async (id) => {
  const game = await Game.findByPk(id);
  if (!game) return null;
  await game.destroy();
  return true;
};

// Listar todos los juegos
const listGames = async () => {
  const games = await Game.findAll();
  return map(identity)(games);
};

// Agregar jugador a un juego
const addPlayerToGame = async (gameId, playerId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null; // Verificar si el jugador ya está en el juego
    const existingPlayers = await game.getPlayers();
    const isAlreadyInGame = existingPlayers.some(
      (player) => player.id === playerId
    );
    if (isAlreadyInGame) return "already_joined"; // Obtener el jugador y agregarlo al juego
    const player = await Player.findByPk(playerId);
    if (!player) return null;
    await game.addPlayer(player);
    return true;
  } catch (error) {
    console.error("Error adding player to game:", error);
    throw error;
  }
};

// Obtener jugadores de un juego
const getPlayersInGame = async (gameId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return [];
    const players = await game.getPlayers();
    return map(identity)(players);
  } catch (error) {
    console.error("Error getting players in game:", error);
    return [];
  }
};

// Iniciar juego (cambia estado si todos están listos)
const startGame = async (gameId, userId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null; // Verificar que el usuario sea el creador
    if (game.creatorId !== userId) return "not_creator"; // Verificar que haya al menos un jugador en el juego
    const players = await game.getPlayers();
    if (players.length === 0) {
      return "no_players";
    } // Inicializar el mazo de cartas antes de repartir
    await cardService.initDeck(); // Iniciar el juego

    await game.update({ status: "started" }); // Repartir cartas a todos los jugadores
    await playerCardService.dealCardsToAllPlayers(gameId);
    return game;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
};

// Finalizar juego
const finishGame = async (gameId) => {
  const game = await Game.findByPk(gameId);
  if (!game) return null;
  await game.update({ status: "finished" });
  return game;
};

const removePlayerFromGame = async (gameId, playerId) => {
  try {
    const game = await Game.findByPk(gameId);
    if (!game) return null;
    const players = await game.getPlayers();
    const isInGame = players.some((p) => p.id === playerId);
    if (!isInGame) return "not_in_game";
    await game.removePlayer(playerId);
    return true;
  } catch (error) {
    console.error("Error removing player from game:", error);
    throw error;
  }
};

const endGame = async (gameId, userId) => {
  const game = await Game.findByPk(gameId);
  if (!game) return null;
  if (game.creatorId !== userId) return "not_creator";
  await game.update({ status: "finished" });
  return game;
};

export default {
  createGame,
  getGameById,
  updateGame,
  deleteGame,
  listGames,
  addPlayerToGame,
  getPlayersInGame,
  startGame,
  finishGame,
  removePlayerFromGame,
  endGame,
};
