// Game Service
class GameService {
    constructor() {
        this.api = window.apiService;
        this.currentGame = null;
        this.currentPlayer = null;
        this.gameInterval = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.refreshGames();
    }
    
    setupEventListeners() {
        // Game lobby buttons
        document.getElementById('createGameBtn').addEventListener('click', () => this.createGame());
        document.getElementById('refreshGamesBtn').addEventListener('click', () => this.refreshGames());
        
        // Game room buttons
        document.getElementById('leaveGameBtn').addEventListener('click', () => this.leaveCurrentGame());
        document.getElementById('startGameBtn').addEventListener('click', () => this.startCurrentGame());
        document.getElementById('drawCardBtn').addEventListener('click', () => this.drawCard());
        document.getElementById('sayUnoBtn').addEventListener('click', () => this.sayUno());
        
        // Deck click
        document.getElementById('drawDeck').addEventListener('click', () => this.drawCard());
    }
    
    async refreshGames() {
        try {
            const games = await this.api.getGames();
            this.displayGames(games);
        } catch (error) {
            console.error('Error refreshing games:', error);
            window.uiService.showMessage('Error al cargar juegos', 'error');
        }
    }
    
    displayGames(games) {
        const container = document.getElementById('gamesContainer');
        container.innerHTML = '';
        
        if (!games || games.length === 0) {
            container.innerHTML = '<p>No hay juegos disponibles</p>';
            return;
        }
        
        games.forEach(game => {
            const gameElement = this.createGameElement(game);
            container.appendChild(gameElement);
        });
    }
    
    createGameElement(game) {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-item';
        gameDiv.innerHTML = `
            <h4>${game.name}</h4>
            <p>${game.rules || 'Reglas estándar'}</p>
            <p>Jugadores: ${game.players ? game.players.length : 0}/${game.maxPlayers || 4}</p>
            <p>Estado: ${this.getGameStatusText(game.status)}</p>
            <div class="game-actions">
                <button class="btn btn-primary join-game-btn" data-game-id="${game.id}">
                    Unirse
                </button>
                <button class="btn btn-info view-game-btn" data-game-id="${game.id}">
                    Ver
                </button>
            </div>
        `;
        
        // Add event listeners
        gameDiv.querySelector('.join-game-btn').addEventListener('click', () => this.joinGame(game.id));
        gameDiv.querySelector('.view-game-btn').addEventListener('click', () => this.viewGame(game.id));
        
        // Disable join button if game is full or user is already in it
        const user = window.authService.getCurrentUser();
        if (game.players && game.players.length >= (game.maxPlayers || 4)) {
            gameDiv.querySelector('.join-game-btn').disabled = true;
            gameDiv.querySelector('.join-game-btn').textContent = 'Lleno';
        }
        
        if (user && game.players && game.players.some(p => p.id === user.id)) {
            gameDiv.querySelector('.join-game-btn').disabled = true;
            gameDiv.querySelector('.join-game-btn').textContent = 'Ya estás en este juego';
        }
        
        return gameDiv;
    }
    
    getGameStatusText(status) {
        const statusMap = {
            'waiting': 'Esperando jugadores',
            'playing': 'En juego',
            'finished': 'Terminado'
        };
        return statusMap[status] || status;
    }
    
    async createGame() {
        const user = window.authService.getCurrentUser();
        if (!user) {
            window.uiService.showMessage('Debes iniciar sesión para crear un juego', 'error');
            return;
        }
        
        const gameName = prompt('Nombre del juego:');
        if (!gameName) return;
        
        const gameRules = prompt('Reglas del juego (opcional):');
        
        try {
            const gameData = {
                name: gameName,
                rules: gameRules || 'Reglas estándar UNO',
                maxPlayers: 4,
                creatorId: user.id
            };
            
            const response = await this.api.createGame(gameData);
            
            if (response.success) {
                window.uiService.showMessage('Juego creado exitosamente', 'success');
                this.refreshGames();
                this.joinGame(response.id);
            } else {
                throw new Error(response.message || 'Error al crear el juego');
            }
        } catch (error) {
            console.error('Error creating game:', error);
            window.uiService.showMessage('Error al crear el juego', 'error');
        }
    }
    
    async joinGame(gameId) {
        const user = window.authService.getCurrentUser();
        if (!user) {
            window.uiService.showMessage('Debes iniciar sesión para unirte a un juego', 'error');
            return;
        }
        
        try {
            const response = await this.api.joinGame(gameId);
            
            if (response.success) {
                this.currentGame = await this.api.getGame(gameId);
                this.showGameRoom();
                window.uiService.showMessage('Te has unido al juego', 'success');
                this.startGameUpdates();
            } else {
                throw new Error(response.message || 'Error al unirse al juego');
            }
        } catch (error) {
            console.error('Error joining game:', error);
            window.uiService.showMessage('Error al unirse al juego', 'error');
        }
    }
    
    async viewGame(gameId) {
        try {
            const game = await this.api.getGame(gameId);
            this.currentGame = game;
            this.showGameRoom();
        } catch (error) {
            console.error('Error viewing game:', error);
            window.uiService.showMessage('Error al cargar el juego', 'error');
        }
    }
    
    async leaveCurrentGame() {
        if (!this.currentGame) return;
        
        try {
            await this.api.leaveGame(this.currentGame.id);
            this.currentGame = null;
            this.showGameLobby();
            window.uiService.showMessage('Has abandonado el juego', 'info');
            this.stopGameUpdates();
        } catch (error) {
            console.error('Error leaving game:', error);
            window.uiService.showMessage('Error al abandonar el juego', 'error');
        }
    }
    
    async startCurrentGame() {
        if (!this.currentGame) return;
        
        const user = window.authService.getCurrentUser();
        if (!user || this.currentGame.creatorId !== user.id) {
            window.uiService.showMessage('Solo el creador puede iniciar el juego', 'error');
            return;
        }
        
        try {
            const response = await this.api.startGame(this.currentGame.id);
            
            if (response.success) {
                window.uiService.showMessage('Juego iniciado', 'success');
                this.updateGameState();
            } else {
                throw new Error(response.message || 'Error al iniciar el juego');
            }
        } catch (error) {
            console.error('Error starting game:', error);
            window.uiService.showMessage('Error al iniciar el juego', 'error');
        }
    }
    
    showGameLobby() {
        document.getElementById('gameLobby').style.display = 'block';
        document.getElementById('gameRoom').style.display = 'none';
        this.refreshGames();
    }
    
    showGameRoom() {
        document.getElementById('gameLobby').style.display = 'none';
        document.getElementById('gameRoom').style.display = 'block';
        this.updateGameRoomUI();
    }
    
    updateGameRoomUI() {
        if (!this.currentGame) return;
        
        // Update game title
        document.getElementById('gameTitle').textContent = this.currentGame.name;
        
        // Update game status
        document.getElementById('gameStatus').textContent = this.getGameStatusText(this.currentGame.status);
        
        // Update players
        this.updatePlayersList();
        
        // Update game controls
        this.updateGameControls();
        
        // Update game state
        this.updateGameState();
    }
    
    updatePlayersList() {
        if (!this.currentGame || !this.currentGame.players) return;
        
        const container = document.getElementById('otherPlayers');
        container.innerHTML = '';
        
        const user = window.authService.getCurrentUser();
        const otherPlayers = this.currentGame.players.filter(p => p.id !== user.id);
        
        otherPlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.innerHTML = `
                <h4>${player.username}</h4>
                <div class="card-count">${player.cardCount || 0} cartas</div>
            `;
            container.appendChild(playerDiv);
        });
    }
    
    updateGameControls() {
        const user = window.authService.getCurrentUser();
        const isCreator = this.currentGame && user && this.currentGame.creatorId === user.id;
        const isPlaying = this.currentGame && this.currentGame.status === 'playing';
        
        // Show/hide start game button
        const startBtn = document.getElementById('startGameBtn');
        startBtn.style.display = isCreator && this.currentGame.status === 'waiting' ? 'inline-block' : 'none';
        
        // Enable/disable game controls
        const drawBtn = document.getElementById('drawCardBtn');
        const unoBtn = document.getElementById('sayUnoBtn');
        
        drawBtn.disabled = !isPlaying;
        unoBtn.disabled = !isPlaying;
    }
    
    async updateGameState() {
        if (!this.currentGame) return;
        
        try {
            // Get game state
            const gameState = await this.api.getGameState(this.currentGame.id);
            
            if (gameState) {
                this.currentGame = { ...this.currentGame, ...gameState };
                this.updateGameRoomUI();
                this.updatePlayerHand();
                this.updateDiscardPile();
            }
        } catch (error) {
            console.error('Error updating game state:', error);
        }
    }
    
    async updatePlayerHand() {
        if (!this.currentGame) return;
        
        const user = window.authService.getCurrentUser();
        if (!user) return;
        
        try {
            // Get player hand using game rules service
            const handData = await this.api.getPlayerHand(this.currentGame.id, user.id);
            
            if (handData && handData.hand) {
                this.displayPlayerHand(handData.hand);
            }
        } catch (error) {
            console.error('Error updating player hand:', error);
        }
    }
    
    displayPlayerHand(hand) {
        const container = document.getElementById('playerCards');
        container.innerHTML = '';
        
        hand.forEach(card => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
        });
    }
    
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.color}`;
        cardDiv.innerHTML = `
            <div class="card-value">${card.value}</div>
            <div class="card-type">${card.type}</div>
        `;
        
        cardDiv.addEventListener('click', () => this.playCard(card));
        
        return cardDiv;
    }
    
    async updateDiscardPile() {
        if (!this.currentGame) return;
        
        try {
            const topCard = await this.api.getTopCard(this.currentGame.id);
            
            if (topCard) {
                const discardPile = document.getElementById('discardPile');
                discardPile.innerHTML = `
                    <div class="card ${topCard.color}">
                        <div class="card-value">${topCard.value}</div>
                        <div class="card-type">${topCard.type}</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error updating discard pile:', error);
        }
    }
    
    async playCard(card) {
        if (!this.currentGame) return;
        
        const user = window.authService.getCurrentUser();
        if (!user) return;
        
        try {
            // Check if it's the player's turn
            const currentPlayer = await this.api.getCurrentPlayer(this.currentGame.id);
            if (currentPlayer && currentPlayer.id !== user.id) {
                window.uiService.showMessage('No es tu turno', 'error');
                return;
            }
            
            // Play the card
            const response = await this.api.playCard(this.currentGame.id, user.id, card.id);
            
            if (response.success) {
                window.uiService.showMessage('Carta jugada', 'success');
                this.updateGameState();
            } else {
                throw new Error(response.message || 'Error al jugar la carta');
            }
        } catch (error) {
            console.error('Error playing card:', error);
            window.uiService.showMessage('Error al jugar la carta', 'error');
        }
    }
    
    async drawCard() {
        if (!this.currentGame) return;
        
        const user = window.authService.getCurrentUser();
        if (!user) return;
        
        try {
            const response = await this.api.drawCard(this.currentGame.id, user.id);
            
            if (response.success) {
                window.uiService.showMessage('Carta robada', 'success');
                this.updateGameState();
            } else {
                throw new Error(response.message || 'Error al robar carta');
            }
        } catch (error) {
            console.error('Error drawing card:', error);
            window.uiService.showMessage('Error al robar carta', 'error');
        }
    }
    
    async sayUno() {
        if (!this.currentGame) return;
        
        const user = window.authService.getCurrentUser();
        if (!user) return;
        
        try {
            const response = await this.api.sayUno(this.currentGame.id, user.id);
            
            if (response.success) {
                window.uiService.showMessage('¡UNO!', 'success');
            } else {
                throw new Error(response.message || 'Error al decir UNO');
            }
        } catch (error) {
            console.error('Error saying UNO:', error);
            window.uiService.showMessage('Error al decir UNO', 'error');
        }
    }
    
    startGameUpdates() {
        // Update game state every 3 seconds
        this.gameInterval = setInterval(() => {
            this.updateGameState();
        }, 3000);
    }
    
    stopGameUpdates() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }
    
    // Public methods
    getCurrentGame() {
        return this.currentGame;
    }
    
    isPlayerInGame() {
        return !!this.currentGame;
    }
    
    getGameStatus() {
        return this.currentGame ? this.currentGame.status : null;
    }
}

// Export game service
const gameService = new GameService();
window.gameService = gameService;