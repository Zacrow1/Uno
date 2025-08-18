// UI Service
class UIService {
    constructor() {
        this.authenticatedUser = null;
        this.messageContainer = null;
        this.init();
    }
    
    init() {
        this.setupMessageContainer();
        this.setupEventListeners();
    }
    
    setupMessageContainer() {
        // Create message container if it doesn't exist
        if (!document.getElementById('messageContainer')) {
            const container = document.createElement('div');
            container.id = 'messageContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 300px;
            `;
            document.body.appendChild(container);
        }
        this.messageContainer = document.getElementById('messageContainer');
    }
    
    setupEventListeners() {
        // Setup any global UI event listeners
        this.setupTooltips();
        this.setupAnimations();
    }
    
    setupTooltips() {
        // Add tooltips to elements with data-tooltip attribute
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e));
            element.addEventListener('mouseleave', (e) => this.hideTooltip(e));
        });
    }
    
    setupAnimations() {
        // Add entrance animations to elements
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in');
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            // Trigger animation when element comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.transition = 'all 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            });
            
            observer.observe(element);
        });
    }
    
    // Message handling
    showMessage(message, type = 'info', duration = 5000) {
        const messageElement = this.createMessageElement(message, type);
        this.messageContainer.appendChild(messageElement);
        
        // Animate in
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
            messageElement.style.opacity = '1';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            this.removeMessage(messageElement);
        }, duration);
        
        return messageElement;
    }
    
    createMessageElement(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas ${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="message-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        messageDiv.style.cssText = `
            background: ${this.getMessageColor(type)};
            color: ${this.getMessageTextColor(type)};
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            min-width: 250px;
        `;
        
        // Add message content styles
        const messageContent = messageDiv.querySelector('.message-content');
        messageContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
        `;
        
        // Add close button styles
        const closeBtn = messageDiv.querySelector('.message-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: ${this.getMessageTextColor(type)};
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            transition: background 0.2s ease;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(0, 0, 0, 0.1)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'none';
        });
        
        return messageDiv;
    }
    
    removeMessage(messageElement) {
        messageElement.style.transform = 'translateX(100%)';
        messageElement.style.opacity = '0';
        
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.parentElement.removeChild(messageElement);
            }
        }, 300);
    }
    
    getMessageIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
    
    getMessageColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            error: 'linear-gradient(135deg, #fa709a, #fee140)',
            warning: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
            info: 'linear-gradient(135deg, #a8edea, #fed6e3)'
        };
        return colors[type] || colors.info;
    }
    
    getMessageTextColor(type) {
        const colors = {
            success: '#0066cc',
            error: '#cc0000',
            warning: '#cc6600',
            info: '#0066cc'
        };
        return colors[type] || colors.info;
    }
    
    // Loading states
    showLoading(element, text = 'Cargando...') {
        const originalContent = element.innerHTML;
        element.innerHTML = `
            <div class="loading-content">
                <div class="loading"></div>
                <span>${text}</span>
            </div>
        `;
        element.disabled = true;
        
        // Store original content
        element.dataset.originalContent = originalContent;
        
        return element;
    }
    
    hideLoading(element) {
        const originalContent = element.dataset.originalContent;
        if (originalContent) {
            element.innerHTML = originalContent;
            element.disabled = false;
            delete element.dataset.originalContent;
        }
    }
    
    // Modal handling
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('fade-in');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('fade-in');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Form handling
    validateForm(form) {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'Este campo es requerido');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });
        
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        `;
        
        field.style.borderColor = '#e74c3c';
        field.parentNode.appendChild(errorDiv);
    }
    
    clearFieldError(field) {
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Navigation
    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.game-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show requested section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('fade-in');
        }
    }
    
    // User interface updates
    setAuthenticatedUser(user) {
        this.authenticatedUser = user;
        this.updateUserInterface(user);
    }
    
    updateUserInterface(user) {
        // Update user-related UI elements
        const userElements = document.querySelectorAll('[data-user-info]');
        userElements.forEach(element => {
            if (user) {
                element.textContent = user.username || user.email || 'Usuario';
                element.style.display = 'block';
            } else {
                element.textContent = 'Invitado';
                element.style.display = 'block';
            }
        });
        
        // Update authentication-related buttons
        const authButtons = document.querySelectorAll('[data-auth-required]');
        authButtons.forEach(button => {
            button.disabled = !user;
        });
        
        // Update user-only content
        const userContent = document.querySelectorAll('[data-user-only]');
        userContent.forEach(content => {
            content.style.display = user ? 'block' : 'none';
        });
        
        // Update guest-only content
        const guestContent = document.querySelectorAll('[data-guest-only]');
        guestContent.forEach(content => {
            content.style.display = user ? 'none' : 'block';
        });
    }
    
    // Game UI updates
    updateGameStatus(status) {
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `game-status ${status.toLowerCase()}`;
        }
    }
    
    updatePlayerInfo(players) {
        const playersContainer = document.getElementById('playersList');
        if (!playersContainer) return;
        
        playersContainer.innerHTML = '';
        
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-info';
            playerDiv.innerHTML = `
                <div class="player-name">${player.username}</div>
                <div class="player-details">
                    <span class="player-cards">${player.cardCount || 0} cartas</span>
                    ${player.isCurrentPlayer ? '<span class="current-turn">Turno actual</span>' : ''}
                </div>
            `;
            playersContainer.appendChild(playerDiv);
        });
    }
    
    // Card animations
    animateCard(cardElement, animation) {
        cardElement.style.animation = `${animation} 0.5s ease`;
        
        setTimeout(() => {
            cardElement.style.animation = '';
        }, 500);
    }
    
    // Tooltip handling
    showTooltip(event) {
        const element = event.target;
        const tooltipText = element.getAttribute('data-tooltip');
        
        if (!tooltipText) return;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        element.tooltip = tooltip;
    }
    
    hideTooltip(event) {
        const element = event.target;
        if (element.tooltip) {
            element.tooltip.remove();
            element.tooltip = null;
        }
    }
    
    // Responsive utilities
    isMobile() {
        return window.innerWidth <= 768;
    }
    
    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }
    
    isDesktop() {
        return window.innerWidth > 1024;
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
    
    // Format utilities
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatNumber(num) {
        return new Intl.NumberFormat('es-ES').format(num);
    }
    
    // Error handling
    handleError(error, customMessage = 'Ha ocurrido un error') {
        console.error('Error:', error);
        
        let message = customMessage;
        if (error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        this.showMessage(message, 'error');
    }
    
    // Success handling
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    // Warning handling
    showWarning(message) {
        this.showMessage(message, 'warning');
    }
    
    // Info handling
    showInfo(message) {
        this.showMessage(message, 'info');
    }
}

// Export UI service
const uiService = new UIService();
window.uiService = uiService;