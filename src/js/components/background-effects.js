// Cyberpunk Background Effects
class BackgroundEffects {
    static canvas = null;
    static ctx = null;
    static particles = [];
    static animationId = null;
    static theme = null;

    static init() {
        this.setupCanvas();
        this.createParticles();
        this.startAnimation();
        this.setupDataStreams();
        
        console.log('🌟 Background Effects initialized');
    }

    static setupCanvas() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    static resizeCanvas() {
        if (!this.canvas) return;

        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Recreate particles on resize
        this.createParticles();
    }

    static createParticles() {
        if (!this.canvas) return;

        this.particles = [];
        const particleCount = Math.min(50, Math.floor((this.canvas.width * this.canvas.height) / 10000));

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    static createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            hue: Math.random() * 360,
            life: Math.random() * 1000 + 500,
            maxLife: 1000,
            type: Math.random() < 0.7 ? 'dot' : 'line',
            length: Math.random() * 20 + 10,
            angle: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulsePhase: Math.random() * Math.PI * 2
        };
    }

    static startAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.animate();
    }

    static animate() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        this.drawConnections();
        
        // Draw neural network effect
        this.drawNeuralNetwork();
        
        // Draw data flow
        this.drawDataFlow();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    static updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Update life
            particle.life--;
            
            // Update pulse
            particle.pulsePhase += particle.pulseSpeed;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                this.particles.push(this.createParticle());
            }
        }
    }

    static drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            
            // Calculate pulse effect
            const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
            const alpha = particle.opacity * pulse * (particle.life / particle.maxLife);
            
            if (particle.type === 'dot') {
                this.drawParticleDot(particle, alpha);
            } else {
                this.drawParticleLine(particle, alpha);
            }
            
            this.ctx.restore();
        });
    }

    static drawParticleDot(particle, alpha) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
        );
        
        const color = this.getThemeColor(particle.hue);
        gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    static drawParticleLine(particle, alpha) {
        const endX = particle.x + Math.cos(particle.angle) * particle.length;
        const endY = particle.y + Math.sin(particle.angle) * particle.length;
        
        const gradient = this.ctx.createLinearGradient(
            particle.x, particle.y, endX, endY
        );
        
        const color = this.getThemeColor(particle.hue);
        gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = particle.size * 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }

    static drawConnections() {
        const maxDistance = 100;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const alpha = (1 - distance / maxDistance) * 0.1;
                    const color = this.getThemeColor(180);
                    
                    this.ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    static drawNeuralNetwork() {
        const time = Date.now() * 0.001;
        const nodes = 8;
        const centerX = this.canvas.width * 0.8;
        const centerY = this.canvas.height * 0.2;
        const radius = 50;
        
        // Draw neural nodes
        for (let i = 0; i < nodes; i++) {
            const angle = (i / nodes) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;
            const alpha = 0.3 * pulse;
            
            const color = this.getThemeColor(i * 45);
            
            this.ctx.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw connections to center
            this.ctx.strokeStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha * 0.5})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
        
        // Draw center node
        const centerPulse = Math.sin(time * 3) * 0.5 + 0.5;
        const centerColor = this.getThemeColor(0);
        this.ctx.fillStyle = `hsla(${centerColor.h}, ${centerColor.s}%, ${centerColor.l}%, ${centerPulse * 0.5})`;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    static drawDataFlow() {
        const time = Date.now() * 0.002;
        const streams = 3;
        
        for (let i = 0; i < streams; i++) {
            const y = (this.canvas.height / streams) * i + (this.canvas.height / streams) * 0.5;
            const flow = (time + i) % 2;
            const x = (flow / 2) * this.canvas.width;
            
            const gradient = this.ctx.createLinearGradient(
                x - 50, y, x + 50, y
            );
            
            const color = this.getThemeColor(i * 120);
            gradient.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
            gradient.addColorStop(0.5, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.3)`);
            gradient.addColorStop(1, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 50, y - 2, 100, 4);
        }
    }

    static getThemeColor(hue) {
        // Convert theme colors to HSL
        const themeColors = {
            cyberpunk: { h: 180, s: 100, l: 50 }, // Cyan
            terminal: { h: 120, s: 100, l: 50 },  // Green
            synthwave: { h: 320, s: 100, l: 50 }, // Magenta
            ice: { h: 200, s: 20, l: 70 }         // Light blue
        };
        
        const currentTheme = document.body.classList.contains('theme-terminal') ? 'terminal' :
                           document.body.classList.contains('theme-synthwave') ? 'synthwave' :
                           document.body.classList.contains('theme-ice') ? 'ice' : 'cyberpunk';
        
        const baseColor = themeColors[currentTheme];
        
        return {
            h: (baseColor.h + hue) % 360,
            s: baseColor.s,
            l: baseColor.l
        };
    }

    static updateTheme(theme) {
        this.theme = theme;
        // Update particle colors gradually
        this.particles.forEach(particle => {
            particle.hue = Math.random() * 60; // Constrain to theme-appropriate hues
        });
    }

    static setupDataStreams() {
        // Create animated data stream elements
        const dataStream = document.querySelector('.data-stream');
        if (!dataStream) return;

        // Add binary data flowing across screen
        this.createBinaryStream();
    }

    static createBinaryStream() {
        const container = document.querySelector('.cyber-background');
        if (!container) return;

        const streamElement = document.createElement('div');
        streamElement.className = 'data-stream-text';
        streamElement.style.position = 'absolute';
        streamElement.style.top = Math.random() * 100 + '%';
        streamElement.style.fontSize = '10px';
        streamElement.style.fontFamily = 'monospace';
        streamElement.style.color = 'rgba(0, 255, 0, 0.3)';
        streamElement.style.whiteSpace = 'nowrap';
        streamElement.style.pointerEvents = 'none';
        streamElement.style.zIndex = '1';

        // Generate random binary data
        let binaryData = '';
        for (let i = 0; i < 100; i++) {
            binaryData += Math.random() < 0.5 ? '0' : '1';
            if (i % 8 === 7) binaryData += ' ';
        }
        streamElement.textContent = binaryData;

        container.appendChild(streamElement);

        // Remove after animation
        setTimeout(() => {
            if (streamElement.parentNode) {
                streamElement.parentNode.removeChild(streamElement);
            }
        }, 8000);

        // Create new stream randomly
        setTimeout(() => {
            if (Math.random() < 0.3) {
                this.createBinaryStream();
            }
        }, Math.random() * 5000 + 2000);
    }

    static addGlitchEffect(element, duration = 1000) {
        if (!element) return;

        element.classList.add('glitch');
        element.setAttribute('data-text', element.textContent);

        setTimeout(() => {
            element.classList.remove('glitch');
            element.removeAttribute('data-text');
        }, duration);
    }

    static addScanlineEffect(element) {
        if (!element) return;

        element.classList.add('scan-lines');
        
        // Remove after some time if desired
        setTimeout(() => {
            element.classList.remove('scan-lines');
        }, 5000);
    }

    static createParticleExplosion(x, y, color = '#00ffff') {
        if (!this.canvas || !this.ctx) return;

        const explosionParticles = [];
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = Math.random() * 5 + 2;
            
            explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 60,
                maxLife: 60,
                size: Math.random() * 3 + 1,
                color: color
            });
        }

        const animateExplosion = () => {
            explosionParticles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                particle.life--;

                const alpha = particle.life / particle.maxLife;
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();

                if (particle.life <= 0) {
                    explosionParticles.splice(index, 1);
                }
            });

            if (explosionParticles.length > 0) {
                requestAnimationFrame(animateExplosion);
            }
        };

        animateExplosion();
    }

    static destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.particles = [];
        
        if (this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}