// Theme Management System
class ThemeManager {
    static themes = {
        cyberpunk: {
            name: 'Cyberpunk',
            primary: '#00ffff',
            secondary: '#ff00ff',
            accent: '#00ff00',
            warning: '#ffff00',
            danger: '#ff0040'
        },
        terminal: {
            name: 'Terminal',
            primary: '#00ff00',
            secondary: '#ffff00',
            accent: '#ffffff',
            warning: '#ff8800',
            danger: '#ff0000'
        },
        synthwave: {
            name: 'Synthwave',
            primary: '#ff006e',
            secondary: '#8338ec',
            accent: '#3a86ff',
            warning: '#ffbe0b',
            danger: '#fb5607'
        },
        ice: {
            name: 'Ice',
            primary: '#a8dadc',
            secondary: '#457b9d',
            accent: '#1d3557',
            warning: '#f1faee',
            danger: '#e63946'
        }
    };

    static currentTheme = 'cyberpunk';

    static init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('songdna-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.setTheme(savedTheme);
        }

        // Setup theme switching animations
        this.setupThemeTransitions();
    }

    static setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme "${themeName}" not found`);
            return;
        }

        this.currentTheme = themeName;
        const theme = this.themes[themeName];

        // Update CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--cyber-primary', theme.primary);
        root.style.setProperty('--cyber-secondary', theme.secondary);
        root.style.setProperty('--cyber-accent', theme.accent);
        root.style.setProperty('--cyber-warning', theme.warning);
        root.style.setProperty('--cyber-danger', theme.danger);

        // Update glow effects
        root.style.setProperty('--glow-primary', `0 0 20px ${theme.primary}`);
        root.style.setProperty('--glow-secondary', `0 0 20px ${theme.secondary}`);
        root.style.setProperty('--glow-accent', `0 0 20px ${theme.accent}`);
        root.style.setProperty('--glow-soft', `0 0 10px ${theme.primary}33`);

        // Apply theme class to body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);

        // Save theme preference
        localStorage.setItem('songdna-theme', themeName);

        // Trigger theme change event
        this.triggerThemeChange(themeName);

        console.log(`🎨 Theme changed to: ${theme.name}`);
    }

    static setupThemeTransitions() {
        // Add smooth transitions for theme changes
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: 
                    color 0.3s ease,
                    background-color 0.3s ease,
                    border-color 0.3s ease,
                    box-shadow 0.3s ease,
                    text-shadow 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    static triggerThemeChange(themeName) {
        // Animate theme change
        document.body.style.opacity = '0.8';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
            
            // Update particle colors if background effects are active
            if (window.BackgroundEffects) {
                BackgroundEffects.updateTheme(this.themes[themeName]);
            }
            
            // Update visualization colors
            if (window.Visualizations) {
                Visualizations.updateTheme(this.themes[themeName]);
            }
        }, 150);

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName, colors: this.themes[themeName] }
        }));
    }

    static getCurrentTheme() {
        return this.themes[this.currentTheme];
    }

    static getThemeList() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name,
            colors: this.themes[key]
        }));
    }

    static createColorPalette(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return null;

        const palette = document.createElement('div');
        palette.className = 'color-palette';
        palette.innerHTML = `
            <div class="palette-name">${theme.name}</div>
            <div class="palette-colors">
                <div class="color-swatch" style="background: ${theme.primary}" title="Primary"></div>
                <div class="color-swatch" style="background: ${theme.secondary}" title="Secondary"></div>
                <div class="color-swatch" style="background: ${theme.accent}" title="Accent"></div>
                <div class="color-swatch" style="background: ${theme.warning}" title="Warning"></div>
                <div class="color-swatch" style="background: ${theme.danger}" title="Danger"></div>
            </div>
        `;

        return palette;
    }

    static animateColorTransition(element, fromColor, toColor, duration = 300) {
        return new Promise(resolve => {
            let start = null;
            
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                
                // Interpolate between colors
                const color = this.interpolateColor(fromColor, toColor, progress);
                element.style.color = color;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    static interpolateColor(color1, color2, factor) {
        // Simple linear interpolation between hex colors
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color2;
        
        const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
        const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
        const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static adjustBrightness(color, factor) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        const r = Math.max(0, Math.min(255, Math.round(rgb.r * factor)));
        const g = Math.max(0, Math.min(255, Math.round(rgb.g * factor)));
        const b = Math.max(0, Math.min(255, Math.round(rgb.b * factor)));
        
        return this.rgbToHex(r, g, b);
    }

    static createThemePreview(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return null;

        const preview = document.createElement('div');
        preview.className = 'theme-preview';
        preview.innerHTML = `
            <div class="theme-preview-header" style="color: ${theme.primary}; text-shadow: 0 0 10px ${theme.primary}">
                ${theme.name}
            </div>
            <div class="theme-preview-content">
                <div class="preview-button" style="border-color: ${theme.primary}; color: ${theme.primary}">
                    Button
                </div>
                <div class="preview-accent" style="background: ${theme.accent}; box-shadow: 0 0 10px ${theme.accent}">
                </div>
                <div class="preview-text" style="color: ${theme.secondary}">
                    Sample Text
                </div>
            </div>
        `;

        return preview;
    }
}