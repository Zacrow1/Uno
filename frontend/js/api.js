// API Configuration
const API = {
    BASE_URL: 'http://localhost:3000/api',
    
    // Authentication endpoints
    AUTH: {
        REGISTER: '/players/register',
        LOGIN: '/players/login',
        LOGOUT: '/players/logout',
        PROFILE: '/players/profile'
    },
    
    // Player endpoints
    PLAYERS: {
        LIST: '/players',
        CREATE: '/players',
        GET: '/players/:id',
        UPDATE: '/players/:id',
        DELETE: '/players/:id'
    },
    
    // Game endpoints
    GAMES: {
        LIST: '/games',
        CREATE: '/games',
        GET: '/games/:id',
        UPDATE: '/games/:id',
        DELETE: '/games/:id',
        JOIN: '/games/:id/join',
        LEAVE: '/games/:id/leave',
        START: '/games/:id/start',
        STATE: '/games/:id/state',
        PLAYERS: '/games/:id/players',
        CURRENT_PLAYER: '/games/:id/current-player',
        TOP_CARD: '/games/:id/top-card',
        SCORES: '/games/:id/scores'
    },
    
    // Game Rules endpoints
    GAME_RULES: {
        DEAL_CARDS: '/game/deal-cards',
        PLAY_CARD: '/game/play-card',
        DRAW_CARD: '/game/draw-card',
        SAY_UNO: '/game/say-uno',
        CHALLENGE_UNO: '/game/challenge-uno',
        GET_VALID_MOVES: '/game/valid-moves',
        GET_GAME_STATE: '/game/state',
        GET_PLAYER_HAND: '/game/player-hand',
        GET_DISCARD_PILE: '/game/discard-pile',
        GET_CURRENT_PLAYER: '/game/current-player',
        GET_DIRECTION: '/game/direction',
        IS_GAME_OVER: '/game/is-over',
        GET_WINNER: '/game/winner',
        RESET_GAME: '/game/reset'
    },
    
    // Card endpoints
    CARDS: {
        LIST: '/cards',
        CREATE: '/cards',
        GET: '/cards/:id',
        UPDATE: '/cards/:id',
        DELETE: '/cards/:id'
    },
    
    // Score endpoints
    SCORES: {
        LIST: '/scores',
        CREATE: '/scores',
        GET: '/scores/:id',
        UPDATE: '/scores/:id',
        DELETE: '/scores/:id'
    }
};

// API Service Class
class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.baseUrl = API.BASE_URL;
    }
    
    // Generic HTTP methods
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        try {
            const response = await fetch(url, config);
            
            // Handle unauthorized responses
            if (response.status === 401) {
                this.clearAuth();
                window.location.reload();
                return null;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en la solicitud');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, { 
            method: 'POST', 
            body: JSON.stringify(data) 
        });
    }
    
    async put(endpoint, data) {
        return this.request(endpoint, { 
            method: 'PUT', 
            body: JSON.stringify(data) 
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // Authentication methods
    async register(userData) {
        const response = await this.post(API.AUTH.REGISTER, userData);
        if (response && response.token) {
            this.setAuth(response.token, response.user);
        }
        return response;
    }
    
    async login(credentials) {
        const response = await this.post(API.AUTH.LOGIN, credentials);
        if (response && response.token) {
            this.setAuth(response.token, response.user);
        }
        return response;
    }
    
    async logout() {
        try {
            await this.post(API.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
        }
    }
    
    async getProfile() {
        return this.get(API.AUTH.PROFILE);
    }
    
    // Player methods
    async getPlayers() {
        return this.get(API.PLAYERS.LIST);
    }
    
    async createPlayer(playerData) {
        return this.post(API.PLAYERS.CREATE, playerData);
    }
    
    async getPlayer(id) {
        return this.get(API.PLAYERS.GET.replace(':id', id));
    }
    
    async updatePlayer(id, playerData) {
        return this.put(API.PLAYERS.UPDATE.replace(':id', id), playerData);
    }
    
    async deletePlayer(id) {
        return this.delete(API.PLAYERS.DELETE.replace(':id', id));
    }
    
    // Game methods
    async getGames() {
        return this.get(API.GAMES.LIST);
    }
    
    async createGame(gameData) {
        return this.post(API.GAMES.CREATE, gameData);
    }
    
    async getGame(id) {
        return this.get(API.GAMES.GET.replace(':id', id));
    }
    
    async updateGame(id, gameData) {
        return this.put(API.GAMES.UPDATE.replace(':id', id), gameData);
    }
    
    async deleteGame(id) {
        return this.delete(API.GAMES.DELETE.replace(':id', id));
    }
    
    async joinGame(id) {
        return this.post(API.GAMES.JOIN.replace(':id', id));
    }
    
    async leaveGame(id) {
        return this.post(API.GAMES.LEAVE.replace(':id', id));
    }
    
    async startGame(id) {
        return this.post(API.GAMES.START.replace(':id', id));
    }
    
    async getGameState(id) {
        return this.get(API.GAMES.STATE.replace(':id', id));
    }
    
    async getGamePlayers(id) {
        return this.get(API.GAMES.PLAYERS.replace(':id', id));
    }
    
    async getCurrentPlayer(id) {
        return this.get(API.GAMES.CURRENT_PLAYER.replace(':id', id));
    }
    
    async getTopCard(id) {
        return this.get(API.GAMES.TOP_CARD.replace(':id', id));
    }
    
    async getGameScores(id) {
        return this.get(API.GAMES.SCORES.replace(':id', id));
    }
    
    // Game Rules methods
    async dealCards(gameId, playerId) {
        return this.post(API.GAME_RULES.DEAL_CARDS, { gameId, playerId });
    }
    
    async playCard(gameId, playerId, cardId, color = null) {
        return this.post(API.GAME_RULES.PLAY_CARD, { 
            gameId, 
            playerId, 
            cardId, 
            color 
        });
    }
    
    async drawCard(gameId, playerId) {
        return this.post(API.GAME_RULES.DRAW_CARD, { gameId, playerId });
    }
    
    async sayUno(gameId, playerId) {
        return this.post(API.GAME_RULES.SAY_UNO, { gameId, playerId });
    }
    
    async challengeUno(gameId, challengerId, challengedId) {
        return this.post(API.GAME_RULES.CHALLENGE_UNO, { 
            gameId, 
            challengerId, 
            challengedId 
        });
    }
    
    async getValidMoves(gameId, playerId) {
        return this.post(API.GAME_RULES.GET_VALID_MOVES, { gameId, playerId });
    }
    
    async getGameRulesState(gameId) {
        return this.post(API.GAME_RULES.GET_GAME_STATE, { gameId });
    }
    
    async getPlayerHand(gameId, playerId) {
        return this.post(API.GAME_RULES.GET_PLAYER_HAND, { gameId, playerId });
    }
    
    async getDiscardPile(gameId) {
        return this.post(API.GAME_RULES.GET_DISCARD_PILE, { gameId });
    }
    
    async getCurrentPlayerRules(gameId) {
        return this.post(API.GAME_RULES.GET_CURRENT_PLAYER, { gameId });
    }
    
    async getDirection(gameId) {
        return this.post(API.GAME_RULES.GET_DIRECTION, { gameId });
    }
    
    async isGameOver(gameId) {
        return this.post(API.GAME_RULES.IS_GAME_OVER, { gameId });
    }
    
    async getWinner(gameId) {
        return this.post(API.GAME_RULES.GET_WINNER, { gameId });
    }
    
    async resetGame(gameId) {
        return this.post(API.GAME_RULES.RESET_GAME, { gameId });
    }
    
    // Card methods
    async getCards() {
        return this.get(API.CARDS.LIST);
    }
    
    async createCard(cardData) {
        return this.post(API.CARDS.CREATE, cardData);
    }
    
    async getCard(id) {
        return this.get(API.CARDS.GET.replace(':id', id));
    }
    
    async updateCard(id, cardData) {
        return this.put(API.CARDS.UPDATE.replace(':id', id), cardData);
    }
    
    async deleteCard(id) {
        return this.delete(API.CARDS.DELETE.replace(':id', id));
    }
    
    // Score methods
    async getScores() {
        return this.get(API.SCORES.LIST);
    }
    
    async createScore(scoreData) {
        return this.post(API.SCORES.CREATE, scoreData);
    }
    
    async getScore(id) {
        return this.get(API.SCORES.GET.replace(':id', id));
    }
    
    async updateScore(id, scoreData) {
        return this.put(API.SCORES.UPDATE.replace(':id', id), scoreData);
    }
    
    async deleteScore(id) {
        return this.delete(API.SCORES.DELETE.replace(':id', id));
    }
    
    // Authentication helper methods
    setAuth(token, user) {
        this.token = token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }
    
    clearAuth() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    
    getToken() {
        return this.token;
    }
}

// Export API service
const apiService = new ApiService();
window.apiService = apiService; // Make it globally available