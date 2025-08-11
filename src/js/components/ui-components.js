// UI Components and Interactions
class UIComponents {
    static init() {
        this.setupButtonEffects();
        this.setupTooltips();
        this.setupModals();
        this.setupNotifications();
        this.setupProgressBars();
        
        console.log('🎛️ UI Components initialized');
    }

    static setupButtonEffects() {
        // Add hover and click effects to all cyber buttons
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('cyber-button') || e.target.classList.contains('nav-item')) {
                this.addButtonHoverEffect(e.target);
                SoundEngine.play('hover');
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cyber-button')) {
                this.addButtonClickEffect(e.target);
            }
        });

        // Add ripple effect to buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cyber-button')) {
                this.createRippleEffect(e.target, e);
            }
        });
    }

    static addButtonHoverEffect(button) {
        // Add temporary glow effect
        button.style.transition = 'all 0.3s ease';
        button.style.transform = 'translateY(-2px)';
        
        // Remove effect after hover
        const removeEffect = () => {
            button.style.transform = '';
            button.removeEventListener('mouseleave', removeEffect);
        };
        
        button.addEventListener('mouseleave', removeEffect);
    }

    static addButtonClickEffect(button) {
        button.classList.add('loading');
        
        setTimeout(() => {
            button.classList.remove('loading');
        }, 300);

        // Create pulse effect
        const pulse = document.createElement('div');
        pulse.className = 'button-pulse';
        pulse.style.position = 'absolute';
        pulse.style.top = '50%';
        pulse.style.left = '50%';
        pulse.style.width = '0';
        pulse.style.height = '0';
        pulse.style.borderRadius = '50%';
        pulse.style.background = 'rgba(0, 255, 255, 0.5)';
        pulse.style.transform = 'translate(-50%, -50%)';
        pulse.style.animation = 'buttonPulse 0.6s ease-out';
        pulse.style.pointerEvents = 'none';
        
        if (button.style.position !== 'relative') {
            button.style.position = 'relative';
        }
        
        button.appendChild(pulse);
        
        setTimeout(() => {
            if (pulse.parentNode) {
                pulse.parentNode.removeChild(pulse);
            }
        }, 600);
    }

    static createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(0, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        if (element.style.position !== 'relative') {
            element.style.position = 'relative';
        }
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    static setupTooltips() {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.id = 'cyber-tooltip';
        tooltip.className = 'cyber-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: var(--bg-card);
            color: var(--cyber-primary);
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-family: var(--font-mono);
            border: 1px solid var(--cyber-primary);
            box-shadow: var(--glow-soft);
            backdrop-filter: blur(10px);
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 200px;
            word-wrap: break-word;
        `;
        document.body.appendChild(tooltip);

        // Add tooltip functionality
        document.addEventListener('mouseover', (e) => {
            const title = e.target.getAttribute('title') || e.target.getAttribute('data-tooltip');
            if (title) {
                this.showTooltip(tooltip, title, e);
                e.target.removeAttribute('title'); // Prevent default tooltip
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (tooltip.style.opacity === '1') {
                this.updateTooltipPosition(tooltip, e);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const title = e.target.getAttribute('data-tooltip');
            if (title) {
                this.hideTooltip(tooltip);
            }
        });
    }

    static showTooltip(tooltip, text, event) {
        tooltip.textContent = text;
        tooltip.style.opacity = '1';
        this.updateTooltipPosition(tooltip, event);
    }

    static updateTooltipPosition(tooltip, event) {
        const x = event.clientX + 10;
        const y = event.clientY - 30;
        
        // Keep tooltip in viewport
        const rect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let finalX = x;
        let finalY = y;
        
        if (x + rect.width > viewportWidth) {
            finalX = event.clientX - rect.width - 10;
        }
        
        if (y < 0) {
            finalY = event.clientY + 20;
        }
        
        tooltip.style.left = finalX + 'px';
        tooltip.style.top = finalY + 'px';
    }

    static hideTooltip(tooltip) {
        tooltip.style.opacity = '0';
    }

    static setupModals() {
        // Modal functionality
        this.modalStack = [];
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalStack.length > 0) {
                this.closeModal(this.modalStack[this.modalStack.length - 1]);
            }
        });
    }

    static showModal(content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'cyber-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${options.title || 'Modal'}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.buttons ? `
                    <div class="modal-footer">
                        ${options.buttons.map(btn => 
                            `<button class="cyber-button ${btn.class || ''}" data-action="${btn.action}">${btn.text}</button>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const backdrop = modal.querySelector('.modal-backdrop');
        backdrop.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        `;

        const content = modal.querySelector('.modal-content');
        content.style.cssText = `
            position: relative;
            background: var(--bg-card);
            border: 1px solid var(--cyber-primary);
            border-radius: var(--radius-lg);
            box-shadow: var(--glow-primary);
            backdrop-filter: blur(10px);
            max-width: 90vw;
            max-height: 90vh;
            overflow: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(modal);
        this.modalStack.push(modal);

        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        backdrop.addEventListener('click', () => {
            this.closeModal(modal);
        });

        // Button actions
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (options.onAction) {
                    options.onAction(action, modal);
                }
            });
        });

        return modal;
    }

    static closeModal(modal) {
        if (!modal) return;

        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.8)';

        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);

        // Remove from stack
        const index = this.modalStack.indexOf(modal);
        if (index > -1) {
            this.modalStack.splice(index, 1);
        }
    }

    static setupNotifications() {
        // Create notification container
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    static showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `cyber-notification notification-${type}`;
        
        const colors = {
            info: 'var(--cyber-primary)',
            success: 'var(--cyber-accent)',
            warning: 'var(--cyber-warning)',
            error: 'var(--cyber-danger)'
        };

        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">&times;</button>
        `;

        notification.style.cssText = `
            background: var(--bg-card);
            border: 1px solid ${colors[type]};
            border-radius: var(--radius-md);
            padding: 12px 16px;
            box-shadow: 0 0 20px ${colors[type]}33;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
        `;

        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.closeNotification(notification);
        });

        // Auto close
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notification);
            }, duration);
        }

        return notification;
    }

    static closeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    static setupProgressBars() {
        // Enhanced progress bar animations
        document.querySelectorAll('.progress-bar').forEach(bar => {
            this.animateProgressBar(bar);
        });
    }

    static animateProgressBar(progressBar, targetWidth = 0, duration = 1000) {
        const fill = progressBar.querySelector('.progress-fill') || 
                    progressBar.querySelector('.status-fill') ||
                    progressBar.querySelector('.similarity-fill');
        
        if (!fill) return;

        let startTime = null;
        const startWidth = parseFloat(fill.style.width) || 0;
        const widthDiff = targetWidth - startWidth;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentWidth = startWidth + (widthDiff * easeOut);
            
            fill.style.width = currentWidth + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    static createLoadingSpinner(size = 40) {
        const spinner = document.createElement('div');
        spinner.className = 'cyber-spinner';
        spinner.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border: 2px solid transparent;
            border-top: 2px solid var(--cyber-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;

        return spinner;
    }

    static createGlowEffect(element, color = 'var(--cyber-primary)', intensity = 1) {
        element.style.boxShadow = `0 0 ${20 * intensity}px ${color}`;
        element.style.border = `1px solid ${color}`;
        
        // Add pulsing effect
        element.style.animation = 'cyberGlow 2s ease-in-out infinite alternate';
    }

    static removeGlowEffect(element) {
        element.style.boxShadow = '';
        element.style.animation = '';
    }

    static typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    }

    static matrixRain(container, duration = 5000) {
        const characters = '01';
        const columns = Math.floor(container.offsetWidth / 20);
        const drops = [];
        
        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        
        const ctx = canvas.getContext('2d');
        container.appendChild(canvas);
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'var(--cyber-accent)';
            ctx.font = '15px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = characters[Math.floor(Math.random() * characters.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);
                
                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        
        const interval = setInterval(draw, 33);
        
        setTimeout(() => {
            clearInterval(interval);
            container.removeChild(canvas);
        }, duration);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes buttonPulse {
        0% { width: 0; height: 0; opacity: 1; }
        100% { width: 200px; height: 200px; opacity: 0; }
    }
    
    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes cyberGlow {
        0% { box-shadow: 0 0 20px var(--cyber-primary); }
        100% { box-shadow: 0 0 40px var(--cyber-primary); }
    }
`;
document.head.appendChild(style);