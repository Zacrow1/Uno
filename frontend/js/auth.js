// Authentication Service
class AuthService {
    constructor() {
        this.api = window.apiService;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }
    
    setupEventListeners() {
        // Login/Register buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showAuthModal('register'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Modal close button
        document.querySelector('.close').addEventListener('click', () => this.hideAuthModal());
        
        // Toggle between login and register
        document.getElementById('toggleAuth').addEventListener('click', () => this.toggleAuthMode());
        
        // Auth form submission
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuthSubmit(e));
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('authModal');
            if (e.target === modal) {
                this.hideAuthModal();
            }
        });
    }
    
    checkAuthStatus() {
        if (this.api.isAuthenticated()) {
            const user = this.api.getUser();
            this.updateUIForAuthenticatedUser(user);
        }
    }
    
    showAuthModal(mode) {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmit');
        const toggleBtn = document.getElementById('toggleAuth');
        const emailGroup = document.getElementById('emailGroup');
        
        if (mode === 'login') {
            title.textContent = 'Iniciar Sesión';
            submitBtn.textContent = 'Iniciar Sesión';
            toggleBtn.textContent = '¿No tienes cuenta? Regístrate';
            emailGroup.style.display = 'none';
        } else {
            title.textContent = 'Registrarse';
            submitBtn.textContent = 'Registrarse';
            toggleBtn.textContent = '¿Ya tienes cuenta? Inicia Sesión';
            emailGroup.style.display = 'block';
        }
        
        modal.style.display = 'block';
        modal.classList.add('fade-in');
    }
    
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        modal.style.display = 'none';
        document.getElementById('authForm').reset();
    }
    
    toggleAuthMode() {
        const title = document.getElementById('authTitle');
        const submitBtn = document.getElementById('authSubmit');
        const toggleBtn = document.getElementById('toggleAuth');
        const emailGroup = document.getElementById('emailGroup');
        
        if (title.textContent === 'Iniciar Sesión') {
            title.textContent = 'Registrarse';
            submitBtn.textContent = 'Registrarse';
            toggleBtn.textContent = '¿Ya tienes cuenta? Inicia Sesión';
            emailGroup.style.display = 'block';
        } else {
            title.textContent = 'Iniciar Sesión';
            submitBtn.textContent = 'Iniciar Sesión';
            toggleBtn.textContent = '¿No tienes cuenta? Regístrate';
            emailGroup.style.display = 'none';
        }
    }
    
    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('authUsername').value;
        const password = document.getElementById('authPassword').value;
        const email = document.getElementById('authEmail').value;
        
        const isLogin = document.getElementById('authTitle').textContent === 'Iniciar Sesión';
        
        try {
            if (isLogin) {
                await this.login(username, password);
            } else {
                await this.register(username, email, password);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async login(username, password) {
        try {
            const response = await this.api.login({ username, password });
            
            if (response.success) {
                this.updateUIForAuthenticatedUser(response.user);
                this.hideAuthModal();
                this.showSuccess('¡Inicio de sesión exitoso!');
                
                // Trigger game refresh
                if (window.gameService) {
                    window.gameService.refreshGames();
                }
            } else {
                throw new Error(response.message || 'Error en el inicio de sesión');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    async register(username, email, password) {
        try {
            const response = await this.api.register({ username, email, password });
            
            if (response.success) {
                this.updateUIForAuthenticatedUser(response.user);
                this.hideAuthModal();
                this.showSuccess('¡Registro exitoso!');
                
                // Trigger game refresh
                if (window.gameService) {
                    window.gameService.refreshGames();
                }
            } else {
                throw new Error(response.message || 'Error en el registro');
            }
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }
    
    async logout() {
        try {
            await this.api.logout();
            this.updateUIForUnauthenticatedUser();
            this.showSuccess('¡Sesión cerrada!');
            
            // Reset game state
            if (window.gameService) {
                window.gameService.leaveCurrentGame();
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.updateUIForUnauthenticatedUser();
        }
    }
    
    updateUIForAuthenticatedUser(user) {
        // Update user info
        document.getElementById('username').textContent = user.username;
        
        // Show/hide buttons
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        
        // Enable game features
        document.getElementById('createGameBtn').disabled = false;
        
        // Update UI service
        if (window.uiService) {
            window.uiService.setAuthenticatedUser(user);
        }
    }
    
    updateUIForUnauthenticatedUser() {
        // Update user info
        document.getElementById('username').textContent = 'Invitado';
        
        // Show/hide buttons
        document.getElementById('loginBtn').style.display = 'inline-block';
        document.getElementById('registerBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'none';
        
        // Disable game features
        document.getElementById('createGameBtn').disabled = true;
        
        // Update UI service
        if (window.uiService) {
            window.uiService.setAuthenticatedUser(null);
        }
    }
    
    showSuccess(message) {
        if (window.uiService) {
            window.uiService.showMessage(message, 'success');
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        if (window.uiService) {
            window.uiService.showMessage(message, 'error');
        } else {
            alert(message);
        }
    }
    
    showInfo(message) {
        if (window.uiService) {
            window.uiService.showMessage(message, 'info');
        }
    }
    
    showWarning(message) {
        if (window.uiService) {
            window.uiService.showMessage(message, 'warning');
        }
    }
    
    // Get current user
    getCurrentUser() {
        return this.api.getUser();
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return this.api.isAuthenticated();
    }
    
    // Get user token
    getToken() {
        return this.api.getToken();
    }
}

// Export auth service
const authService = new AuthService();
window.authService = authService;