// SongDNA Search - Visualizations Component
class Visualizations {
    static charts = {};
    static canvases = {};
    static initialized = false;
    
    static init() {
        if (this.initialized) {
            console.log('Visualizations already initialized');
            return;
        }
        
        console.log('Initializing visualizations...');
        this.initCharts();
        this.initialized = true;
    }

    static initCharts() {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, skipping visualizations');
            return;
        }
        
        // Initialize Chart.js charts with error handling
        try {
            this.initSpectrogram();
            this.initMFCC();
            this.initChroma();
        } catch (error) {
            console.warn('Chart initialization failed:', error);
        }
    }

    static initSpectrogram() {
        const canvas = document.getElementById('spectrogramCanvas');
        if (!canvas) {
            console.warn('Spectrogram canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (this.charts.spectrogram) {
            this.charts.spectrogram.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('Could not get spectrogram canvas context');
            return;
        }

        this.charts.spectrogram = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Spectral Power',
                    data: [],
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }

    static initMFCC() {
        const canvas = document.getElementById('mfccCanvas');
        if (!canvas) {
            console.warn('MFCC canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (this.charts.mfcc) {
            this.charts.mfcc.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('Could not get MFCC canvas context');
            return;
        }

        this.charts.mfcc = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'MFCC Coefficients',
                    data: [],
                    backgroundColor: '#ff00ff',
                    borderColor: '#ff00ff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }

    static initChroma() {
        const canvas = document.getElementById('chromaCanvas');
        if (!canvas) {
            console.warn('Chroma canvas not found');
            return;
        }

        // Destroy existing chart if it exists
        if (this.charts.chroma) {
            this.charts.chroma.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('Could not get chroma canvas context');
            return;
        }

        this.charts.chroma = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
                datasets: [{
                    label: 'Chroma Features',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(0, 255, 255, 0.2)',
                    borderColor: '#00ffff',
                    borderWidth: 2,
                    pointBackgroundColor: '#00ffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            display: false
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }

    static updateSpectrogram(fingerprint) {
        if (!this.charts.spectrogram) {
            console.warn('Spectrogram chart not initialized');
            return;
        }

        try {
            const frequencies = fingerprint.spectral_features || [];
            const labels = frequencies.map((_, i) => i);
            
            this.charts.spectrogram.data.labels = labels;
            this.charts.spectrogram.data.datasets[0].data = frequencies;
            this.charts.spectrogram.update('none');
        } catch (error) {
            console.warn('Failed to update spectrogram:', error);
        }
    }

    static updateMFCC(fingerprint) {
        if (!this.charts.mfcc) {
            console.warn('MFCC chart not initialized');
            return;
        }

        try {
            const mfcc = fingerprint.mfcc || [];
            const labels = mfcc.map((_, i) => `C${i + 1}`);
            
            this.charts.mfcc.data.labels = labels;
            this.charts.mfcc.data.datasets[0].data = mfcc;
            this.charts.mfcc.update('none');
        } catch (error) {
            console.warn('Failed to update MFCC:', error);
        }
    }

    static updateChroma(fingerprint) {
        if (!this.charts.chroma) {
            console.warn('Chroma chart not initialized');
            return;
        }

        try {
            const chroma = fingerprint.chroma || Array(12).fill(0);
            this.charts.chroma.data.datasets[0].data = chroma;
            this.charts.chroma.update('none');
        } catch (error) {
            console.warn('Failed to update chroma:', error);
        }
    }

    static destroy() {
        // Clean up all charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (error) {
                    console.warn('Error destroying chart:', error);
                }
            }
        });
        
        this.charts = {};
        this.initialized = false;
    }

    static resize() {
        // Resize all charts when window resizes
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                try {
                    chart.resize();
                } catch (error) {
                    console.warn('Error resizing chart:', error);
                }
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Visualizations;
}