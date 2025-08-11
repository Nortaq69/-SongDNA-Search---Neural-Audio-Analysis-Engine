// Sound Engine for UI Audio Effects
class SoundEngine {
    static sounds = {};
    static enabled = true;
    static volume = 0.3;
    static context = null;

    static async init() {
        try {
            // Create audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load sound effects
            await this.loadSounds();
            
            console.log('🔊 Sound Engine initialized');
        } catch (error) {
            console.warn('Sound Engine failed to initialize:', error);
        }
    }

    static async loadSounds() {
        const soundDefinitions = {
            click: { frequency: 800, duration: 0.1, type: 'sine' },
            hover: { frequency: 600, duration: 0.05, type: 'sine' },
            success: { frequency: [523, 659, 784], duration: 0.3, type: 'sine' },
            error: { frequency: [200, 150], duration: 0.5, type: 'square' },
            tab: { frequency: [440, 554], duration: 0.15, type: 'sine' },
            startup: { 
                frequency: [261, 329, 392, 523], 
                duration: 0.8, 
                type: 'sine',
                delay: 0.15
            },
            notification: { frequency: [523, 659], duration: 0.25, type: 'sine' },
            processing: { frequency: 300, duration: 2, type: 'sawtooth', loop: true },
            scan: { frequency: [400, 500, 600], duration: 0.2, type: 'square' }
        };

        // Generate procedural sounds
        for (const [name, config] of Object.entries(soundDefinitions)) {
            this.sounds[name] = await this.createSound(config);
        }
    }

    static async createSound(config) {
        if (!this.context) return null;

        const { frequency, duration, type = 'sine', loop = false, delay = 0 } = config;
        
        return {
            play: () => this.playTone(frequency, duration, type, loop, delay),
            config
        };
    }

    static playTone(frequency, duration, type = 'sine', loop = false, delay = 0) {
        if (!this.enabled || !this.context) return;

        try {
            const frequencies = Array.isArray(frequency) ? frequency : [frequency];
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createOscillator(freq, duration / frequencies.length, type, loop);
                }, (delay * index) * 1000);
            });
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }

    static createOscillator(frequency, duration, type, loop = false) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        oscillator.type = type;
        
        // Envelope
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.context.currentTime + 0.01);
        
        if (!loop) {
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        }
        
        oscillator.start(this.context.currentTime);
        
        if (!loop) {
            oscillator.stop(this.context.currentTime + duration);
        }
        
        return { oscillator, gainNode };
    }

    static play(soundName, options = {}) {
        if (!this.enabled || !this.sounds[soundName]) return;

        const sound = this.sounds[soundName];
        
        // Add some randomization for variety
        const { pitchVariation = 0.1, volumeVariation = 0.1 } = options;
        
        if (sound && sound.play) {
            // Temporarily adjust volume
            const originalVolume = this.volume;
            if (volumeVariation > 0) {
                this.volume *= (1 + (Math.random() - 0.5) * volumeVariation);
            }
            
            // Play with optional pitch variation
            if (pitchVariation > 0 && sound.config) {
                const { frequency, duration, type } = sound.config;
                const variedFreq = Array.isArray(frequency) 
                    ? frequency.map(f => f * (1 + (Math.random() - 0.5) * pitchVariation))
                    : frequency * (1 + (Math.random() - 0.5) * pitchVariation);
                
                this.playTone(variedFreq, duration, type);
            } else {
                sound.play();
            }
            
            // Restore original volume
            this.volume = originalVolume;
        }
    }

    static setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('songdna-sound-enabled', enabled);
    }

    static setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('songdna-sound-volume', this.volume);
    }

    static getVolume() {
        return this.volume;
    }

    static isEnabled() {
        return this.enabled;
    }

    // Advanced sound effects
    static playChord(notes, duration = 0.5, type = 'sine') {
        if (!this.enabled || !this.context) return;

        notes.forEach(note => {
            this.createOscillator(note, duration, type);
        });
    }

    static playSequence(sequence, interval = 0.1) {
        if (!this.enabled || !this.context) return;

        sequence.forEach((note, index) => {
            setTimeout(() => {
                if (typeof note === 'object') {
                    this.createOscillator(note.frequency, note.duration || 0.1, note.type || 'sine');
                } else {
                    this.createOscillator(note, 0.1, 'sine');
                }
            }, index * interval * 1000);
        });
    }

    static playProcessingSound() {
        if (!this.enabled || !this.context) return;

        // Create a processing sound loop
        const startTime = this.context.currentTime;
        const duration = 0.1;
        const interval = 0.2;
        
        for (let i = 0; i < 10; i++) {
            const freq = 300 + (i * 20);
            setTimeout(() => {
                this.createOscillator(freq, duration, 'square');
            }, i * interval * 1000);
        }
    }

    static playDataTransferSound() {
        if (!this.enabled || !this.context) return;

        // Simulate data transfer sound
        const frequencies = [400, 450, 500, 550, 600];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 0.05, 'square');
            }, index * 50);
        });
    }

    static playNeuralNetworkSound() {
        if (!this.enabled || !this.context) return;

        // Neural network activation sound
        const baseFreq = 220;
        for (let i = 0; i < 8; i++) {
            const freq = baseFreq * Math.pow(1.2, i);
            setTimeout(() => {
                this.createOscillator(freq, 0.1, 'sine');
            }, i * 100);
        }
    }

    static playGlitchSound() {
        if (!this.enabled || !this.context) return;

        // Glitch effect sound
        for (let i = 0; i < 5; i++) {
            const freq = Math.random() * 1000 + 200;
            setTimeout(() => {
                this.createOscillator(freq, 0.02, 'square');
            }, i * 10);
        }
    }

    // Ambient sound management
    static startAmbient(type = 'cyber') {
        if (!this.enabled || !this.context) return;

        const ambientConfig = {
            cyber: {
                baseFreq: 60,
                harmonics: [2, 3, 5],
                modulation: 0.5
            },
            terminal: {
                baseFreq: 80,
                harmonics: [2, 4],
                modulation: 0.3
            },
            synthwave: {
                baseFreq: 50,
                harmonics: [2, 3, 4, 6],
                modulation: 0.7
            }
        };

        const config = ambientConfig[type] || ambientConfig.cyber;
        
        // Create ambient drone
        config.harmonics.forEach((harmonic, index) => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            const lfo = this.context.createOscillator();
            const lfoGain = this.context.createGain();
            
            // Connect LFO for modulation
            lfo.connect(lfoGain);
            lfoGain.connect(gainNode.gain);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.frequency.setValueAtTime(config.baseFreq * harmonic, this.context.currentTime);
            oscillator.type = 'sine';
            
            lfo.frequency.setValueAtTime(0.1 + (index * 0.05), this.context.currentTime);
            lfo.type = 'sine';
            
            gainNode.gain.setValueAtTime(this.volume * 0.1 / config.harmonics.length, this.context.currentTime);
            lfoGain.gain.setValueAtTime(config.modulation * 0.02, this.context.currentTime);
            
            oscillator.start();
            lfo.start();
        });
    }

    static stopAmbient() {
        // Stop all ambient sounds
        // Implementation would depend on storing references to active oscillators
    }

    // Load/Save preferences
    static loadPreferences() {
        const enabled = localStorage.getItem('songdna-sound-enabled');
        const volume = localStorage.getItem('songdna-sound-volume');
        
        if (enabled !== null) {
            this.enabled = enabled === 'true';
        }
        
        if (volume !== null) {
            this.volume = parseFloat(volume);
        }
    }

    static savePreferences() {
        localStorage.setItem('songdna-sound-enabled', this.enabled);
        localStorage.setItem('songdna-sound-volume', this.volume);
    }
}