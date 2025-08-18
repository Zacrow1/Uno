// Main Application Controller
class App {
    constructor() {
        this.initialized = false;
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        try {
            this.setupServices();
            this.setupEventListeners();
            this.setupErrorHandler();
            this.setupKeyboardShortcuts();
            this.checkBrowserSupport();
            
            this.initialized = true;
            console.log('UNO Game Frontend initialized successfully');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleInitializationError(error);
        }
    }
    
    setupServices() {
        // Check if required services are available
        const requiredServices = ['apiService', 'authService', 'gameService', 'uiService'];
        
        requiredServices.forEach(serviceName => {
            if (!window[serviceName]) {
                throw new Error(`Required service ${serviceName} not found`);
            }
        });
        
        // Services are already initialized in their respective files
        this.api = window.apiService;
        this.auth = window.authService;
        this.game = window.gameService;
        this.ui = window.uiService;
    }
    
    setupEventListeners() {
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.ui.handleError(event.error, 'Ha ocurrido un error inesperado');
        });
        
        // Unhandled promise rejection handling
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.ui.handleError(event.reason, 'Ha ocurrido un error inesperado');
        });
        
        // Network status monitoring
        window.addEventListener('online', () => {
            this.ui.showSuccess('Conexión restablecida');
            this.refreshData();
        });
        
        window.addEventListener('offline', () => {
            this.ui.showWarning('Sin conexión a internet');
        });
        
        // Page visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.refreshData();
            }
        });
        
        // Window resize handling
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    setupErrorHandler() {
        // Custom error handler for API calls
        this.api.setErrorHandler((error) => {
            this.ui.handleError(error);
        });
        
        // Custom error handler for authentication
        this.auth.setErrorHandler((error) => {
            this.ui.handleError(error);
        });
        
        // Custom error handler for game operations
        this.game.setErrorHandler((error) => {
            this.ui.handleError(error);
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Only handle shortcuts if no input is focused
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (event.key) {
                case 'Escape':
                    this.handleEscapeKey();
                    break;
                case 'Enter':
                    this.handleEnterKey(event);
                    break;
                case 'l':
                case 'L':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.showAuthModal();
                    }
                    break;
                case 'r':
                case 'R':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.refreshData();
                    }
                    break;
                case 'g':
                case 'G':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.createGame();
                    }
                    break;
                case 'u':
                case 'U':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this.sayUno();
                    }
                    break;
            }
        });
    }
    
    handleEscapeKey() {
        // Close any open modals
        const openModals = document.querySelectorAll('.modal[style*="block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Close any open menus or dropdowns
        const openMenus = document.querySelectorAll('.menu-open, .dropdown-open');
        openMenus.forEach(menu => {
            menu.classList.remove('menu-open', 'dropdown-open');
        });
    }
    
    handleEnterKey(event) {
        // Handle Enter key for various UI elements
        const activeElement = document.activeElement;
        
        if (activeElement.classList.contains('btn')) {
            event.preventDefault();
            activeElement.click();
        }
    }
    
    checkBrowserSupport() {
        const requiredFeatures = [
            'fetch',
            'Promise',
            'localStorage',
            'sessionStorage',
            'addEventListener',
            'querySelector',
            'classList'
        ];
        
        const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
        
        if (missingFeatures.length > 0) {
            console.warn('Missing browser features:', missingFeatures);
            this.ui.showWarning('Tu navegador puede no soportar todas las características de la aplicación');
        }
        
        // Check for mobile device
        if (this.ui.isMobile()) {
            document.body.classList.add('mobile-device');
        }
        
        // Check for touch support
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
    }
    
    showWelcomeMessage() {
        const user = this.auth.getCurrentUser();
        
        if (user) {
            this.ui.showSuccess(`¡Bienvenido de vuelta, ${user.username}!`);
        } else {
            this.ui.showInfo('¡Bienvenido al juego UNO! Inicia sesión o regístrate para comenzar.');
        }
    }
    
    refreshData() {
        // Refresh all data when coming back online or page becomes visible
        if (this.auth.isAuthenticated()) {
            this.game.refreshGames();
        }
    }
    
    handleResize() {
        // Handle responsive layout changes
        if (this.ui.isMobile()) {
            this.setupMobileLayout();
        } else {
            this.setupDesktopLayout();
        }
    }
    
    setupMobileLayout() {
        // Adjust layout for mobile devices
        document.body.classList.add('mobile-layout');
        document.body.classList.remove('desktop-layout');
        
        // Hide certain elements on mobile
        const mobileHidden = document.querySelectorAll('[data-hide-mobile]');
        mobileHidden.forEach(element => {
            element.style.display = 'none';
        });
    }
    
    setupDesktopLayout() {
        // Adjust layout for desktop devices
        document.body.classList.add('desktop-layout');
        document.body.classList.remove('mobile-layout');
        
        // Show elements hidden on mobile
        const mobileHidden = document.querySelectorAll('[data-hide-mobile]');
        mobileHidden.forEach(element => {
            element.style.display = '';
        });
    }
    
    // Public methods for global access
    showAuthModal() {
        this.auth.showAuthModal('login');
    }
    
    createGame() {
        this.game.createGame();
    }
    
    sayUno() {
        this.game.sayUno();
    }
    
    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Error handling
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Show error to user
        const errorMessage = document.createElement('div');
        errorMessage.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; text-align: center;">
                    <h2 style="color: #e74c3c; margin-bottom: 15px;">Error de Inicialización</h2>
                    <p style="margin-bottom: 20px;">No se pudo inicializar la aplicación correctamente.</p>
                    <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Recargar Página</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorMessage);
    }
    
    // App state management
    getState() {
        return {
            initialized: this.initialized,
            authenticated: this.auth.isAuthenticated(),
            user: this.auth.getCurrentUser(),
            currentGame: this.game.getCurrentGame(),
            isMobile: this.ui.isMobile()
        };
    }
    
    // Performance monitoring
    logPerformance() {
        if (window.performance && window.performance.memory) {
            console.log('Performance Metrics:', {
                memory: {
                    used: window.performance.memory.usedJSHeapSize,
                    total: window.performance.memory.totalJSHeapSize,
                    limit: window.performance.memory.jsHeapSizeLimit
                },
                navigation: window.performance.timing,
                resources: window.performance.getEntriesByType('resource')
            });
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new App();
        
        // Log performance metrics after initialization
        setTimeout(() => {
            if (window.app) {
                window.app.logPerformance();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Fallback error display
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8f9fa;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h1 style="color: #e74c3c; margin-bottom: 20px;">Error de Carga</h1>
                    <p style="margin-bottom: 20px;">No se pudo cargar la aplicación correctamente.</p>
                    <button onclick="location.reload()" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">Recargar Página</button>
                </div>
            </div>
        `;
    }
});

// Export app for debugging
window.App = App;