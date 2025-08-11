// SongDNA Search - Main Application
class SongDNAApp {
    constructor() {
        this.currentSection = 'analyzer';
        this.audioFile = null;
        this.fingerprint = null;
        this.socket = null;
        this.wavesurfer = null;
        this.isProcessing = false;
        this.searchResults = [];
        
        this.init();
    }

    async init() {
        this.showLoading('Initializing Neural Network...');
        
        try {
            // Initialize components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Try to connect to backend (optional)
            try {
                await this.connectToBackend();
                console.log('✅ Backend connected successfully');
            } catch (error) {
                console.warn('⚠️ Backend not available:', error.message);
                console.warn('App will run in offline mode');
            }
            
            // Initialize UI
            this.initializeUI();
            
            // Hide loading
            this.hideLoading();
            
            // Play startup sound
            SoundEngine.play('startup');
            
            console.log('🧬 SongDNA Search initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.hideLoading();
            this.showError('Failed to initialize application: ' + error.message);
            
            // Show error details in console
            if (error.message.includes('Socket.IO')) {
                console.error('Socket.IO not loaded. Check internet connection.');
            }
        }
    }

    async initializeComponents() {
        // Initialize theme manager
        ThemeManager.init();
        
        // Initialize sound engine
        SoundEngine.init();
        
        // Initialize background effects
        BackgroundEffects.init();
        
        // Initialize UI components (check if available)
        if (typeof UIComponents !== 'undefined') {
            UIComponents.init();
        }
        
        // Initialize visualizations (check if available)
        if (typeof Visualizations !== 'undefined') {
            try {
                Visualizations.init();
            } catch (error) {
                console.warn('Failed to initialize visualizations:', error);
            }
        }
        
        // Initialize audio processor (check if available)
        if (typeof AudioProcessor !== 'undefined') {
            AudioProcessor.init();
        }
    }

    setupEventListeners() {
        // Window controls
        document.getElementById('minimizeBtn').addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
            SoundEngine.play('click');
        });

        document.getElementById('maximizeBtn').addEventListener('click', () => {
            window.electronAPI.maximizeWindow();
            SoundEngine.play('click');
        });

        document.getElementById('closeBtn').addEventListener('click', () => {
            window.electronAPI.closeWindow();
            SoundEngine.play('click');
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
                SoundEngine.play('tab');
            });
        });

        // Drop zone
        this.setupDropZone();
        
        // File selection
        document.getElementById('selectFileBtn').addEventListener('click', () => {
            this.selectAudioFile();
            SoundEngine.play('click');
        });

        // Audio controls
        this.setupAudioControls();

        // Search controls
        document.getElementById('searchSimilarBtn').addEventListener('click', () => {
            this.searchSimilar();
        });

        document.getElementById('addToLibraryBtn').addEventListener('click', () => {
            this.addToLibrary();
        });

        // Library controls
        document.getElementById('scanLibraryBtn').addEventListener('click', () => {
            this.scanLibrary();
        });

        document.getElementById('refreshLibraryBtn').addEventListener('click', () => {
            this.refreshLibrary();
        });

        // Settings
        this.setupSettings();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const audioFile = files.find(file => this.isAudioFile(file));
            
            if (audioFile) {
                this.processAudioFile(audioFile.path);
                SoundEngine.play('success');
            } else {
                this.showError('Please drop a valid audio file (MP3, WAV, FLAC, M4A, AAC, OGG)');
                SoundEngine.play('error');
            }
        });
    }

    setupAudioControls() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const volumeSlider = document.querySelector('.volume-slider');

        playPauseBtn.addEventListener('click', () => {
            this.togglePlayback();
            SoundEngine.play('click');
        });

        stopBtn.addEventListener('click', () => {
            this.stopPlayback();
            SoundEngine.play('click');
        });

        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (this.wavesurfer) {
                this.wavesurfer.setVolume(volume);
            }
        });
    }

    setupSettings() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.addEventListener('change', (e) => {
            ThemeManager.setTheme(e.target.value);
            SoundEngine.play('tab');
        });

        // Sound effects toggle
        const soundEffects = document.getElementById('soundEffects');
        soundEffects.addEventListener('change', (e) => {
            SoundEngine.setEnabled(e.target.checked);
        });

        // Auto preview toggle
        const autoPreview = document.getElementById('autoPreview');
        autoPreview.addEventListener('change', (e) => {
            this.autoPreview = e.target.checked;
        });

        // Sliders
        document.querySelectorAll('.cyber-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('setting-value')) {
                    valueDisplay.textContent = e.target.value;
                }
            });
        });
    }

    async connectToBackend() {
        return new Promise((resolve, reject) => {
                    try {
            // Check if io is available
            if (typeof io === 'undefined') {
                throw new Error('Socket.IO not loaded');
            }
            
            // Connect to Python backend via Socket.IO
            this.socket = io('http://localhost:5001');

                this.socket.on('connect', () => {
                    console.log('🔗 Connected to SongDNA backend');
                    resolve();
                });

                this.socket.on('disconnect', () => {
                    console.log('❌ Disconnected from backend');
                });

                this.socket.on('status', (data) => {
                    console.log('Backend status:', data);
                });

                this.socket.on('audio_processed', (data) => {
                    this.handleAudioProcessed(data);
                });

                this.socket.on('search_complete', (data) => {
                    this.handleSearchComplete(data);
                });

                this.socket.on('processing_status', (data) => {
                    this.updateProcessingStatus(data);
                });

                this.socket.on('search_status', (data) => {
                    this.updateSearchStatus(data);
                });

                this.socket.on('scan_status', (data) => {
                    this.updateScanStatus(data);
                });

                this.socket.on('scan_complete', (data) => {
                    this.handleScanComplete(data);
                });

                this.socket.on('error', (data) => {
                    this.showError(data.message);
                    SoundEngine.play('error');
                });

                // Connection timeout
                setTimeout(() => {
                    if (!this.socket.connected) {
                        reject(new Error('Backend connection timeout'));
                    }
                }, 5000);

            } catch (error) {
                reject(error);
            }
        });
    }

    initializeUI() {
        // Initialize waveform
        this.initWavesurfer();
        
        // Load library stats
        this.loadLibraryStats();
        
        // Load settings
        this.loadSettings();
        
        // Initialize visualizations
        if (typeof Visualizations !== 'undefined') {
            try {
                Visualizations.initCharts();
            } catch (error) {
                console.warn('Failed to initialize charts:', error);
            }
        }
        
        // Update system status
        this.updateSystemStatus();
    }

    initWavesurfer() {
        const waveformContainer = document.getElementById('waveform');
        
        // Check if WaveSurfer is available
        if (typeof WaveSurfer === 'undefined') {
            console.warn('WaveSurfer not loaded, using fallback audio player');
            this.createFallbackAudioPlayer();
            return;
        }
        
        this.wavesurfer = WaveSurfer.create({
            container: waveformContainer,
            waveColor: '#00ffff',
            progressColor: '#ff00ff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            barWidth: 2,
            barRadius: 1,
            barGap: 1,
            height: 80,
            normalize: true,
            responsive: true
        });

        this.wavesurfer.on('ready', () => {
            console.log('Waveform ready');
        });

        this.wavesurfer.on('play', () => {
            document.getElementById('playPauseBtn').textContent = '⏸️';
        });

        this.wavesurfer.on('pause', () => {
            document.getElementById('playPauseBtn').textContent = '▶️';
        });
    }

    createFallbackAudioPlayer() {
        const waveformContainer = document.getElementById('waveform');
        if (!waveformContainer) return;
        
        // Create a simple audio player as fallback
        waveformContainer.innerHTML = `
            <div class="fallback-audio-player">
                <audio id="audioPlayer" controls style="width: 100%; margin: 10px 0;">
                    <source src="" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="audio-info" style="color: var(--text-secondary); font-size: 0.9rem; text-align: center; margin-top: 10px;">
                    Audio file loaded successfully
                </div>
            </div>
        `;
        
        this.audioPlayer = document.getElementById('audioPlayer');
        
        // Update play/pause button
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (this.audioPlayer.paused) {
                    this.audioPlayer.play();
                    playPauseBtn.textContent = '⏸️';
                } else {
                    this.audioPlayer.pause();
                    playPauseBtn.textContent = '▶️';
                }
            });
        }
        
        // Update stop button
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.audioPlayer.pause();
                this.audioPlayer.currentTime = 0;
                playPauseBtn.textContent = '▶️';
            });
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;

        // Section-specific initialization
        if (sectionName === 'library') {
            this.loadLibraryData();
        } else if (sectionName === 'history') {
            this.loadHistoryData();
        }
    }

    async selectAudioFile() {
        try {
            const result = await window.electronAPI.selectAudioFile();
            if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                await this.processAudioFile(filePath);
            }
        } catch (error) {
            this.showError('Error selecting file: ' + error.message);
        }
    }

    async processAudioFile(filePath) {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.audioFile = filePath;

        try {
            this.showLoading('Processing audio file...');

            // Load audio into waveform
            if (this.wavesurfer) {
                await this.wavesurfer.load(filePath);
            } else if (this.audioPlayer) {
                // Use fallback audio player
                this.audioPlayer.src = filePath;
                this.audioPlayer.load();
            }

            // Show audio visualization container
            document.getElementById('audioVizContainer').style.display = 'block';

            // Send to backend for processing
            this.socket.emit('process_audio', {
                file_path: filePath
            });

        } catch (error) {
            this.showError('Error processing audio: ' + error.message);
            this.isProcessing = false;
        }
    }

    handleAudioProcessed(data) {
        this.fingerprint = data.fingerprint;
        this.hideLoading();
        this.isProcessing = false;

        // Update UI with analysis results
        this.displayAudioAnalysis(data);

        // Show success message
        this.showSuccess('Audio analysis complete!');
        SoundEngine.play('success');

        console.log('Audio processed:', data);
    }

    displayAudioAnalysis(data) {
        const { fingerprint, metadata } = data;

        // Update beat analysis
        document.getElementById('bpmValue').textContent = Math.round(fingerprint.tempo || 0);
        document.getElementById('keyValue').textContent = fingerprint.key || 'Unknown';
        document.getElementById('energyValue').textContent = (fingerprint.energy * 100).toFixed(1) + '%';

        // Update visualizations
        if (typeof Visualizations !== 'undefined') {
            try {
                Visualizations.updateSpectrogram(fingerprint);
                Visualizations.updateMFCC(fingerprint);
                Visualizations.updateChroma(fingerprint);
            } catch (error) {
                console.warn('Failed to update visualizations:', error);
            }
        }
    }

    async searchSimilar() {
        if (!this.fingerprint) {
            this.showError('Please process an audio file first');
            return;
        }

        try {
            this.showLoading('Searching for similar songs...');

            const searchMode = document.getElementById('searchMode').value;
            const maxResults = parseInt(document.getElementById('maxResults').value);
            const threshold = parseFloat(document.getElementById('similarityThreshold').value);

            this.socket.emit('search_similar', {
                fingerprint: this.fingerprint,
                search_mode: searchMode,
                max_results: maxResults,
                threshold: threshold,
                source_file: this.audioFile
            });

        } catch (error) {
            this.showError('Error starting search: ' + error.message);
        }
    }

    handleSearchComplete(data) {
        this.hideLoading();
        this.searchResults = data.results;

        // Switch to results section
        this.switchSection('results');

        // Display results
        this.displaySearchResults(data.results);

        SoundEngine.play('success');
        console.log('Search complete:', data.results);
    }

    displaySearchResults(results) {
        const container = document.getElementById('resultsContainer');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🎯</div>
                    <h3>No similar songs found</h3>
                    <p>Try adjusting the similarity threshold or search mode</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map((result, index) => `
            <div class="result-item" data-index="${index}">
                <div class="result-rank">${index + 1}</div>
                <div class="result-info">
                    <div class="result-title">${result.title}</div>
                    <div class="result-artist">${result.artist}</div>
                    <div class="result-similarity">
                        <div class="similarity-bar">
                            <div class="similarity-fill" style="width: ${result.similarity * 100}%"></div>
                        </div>
                        <span class="similarity-score">${(result.similarity * 100).toFixed(1)}%</span>
                    </div>
                    <div class="result-meta">
                        ${result.source} • ${result.tempo ? Math.round(result.tempo) + ' BPM' : ''} • ${result.key || ''}
                    </div>
                </div>
                <div class="result-actions">
                    ${result.preview_url ? `<button class="action-btn" onclick="app.playPreview('${result.preview_url}')" title="Preview">▶️</button>` : ''}
                    ${result.spotify_url ? `<button class="action-btn" onclick="app.openExternal('${result.spotify_url}')" title="Open in Spotify">🎵</button>` : ''}
                    ${result.file_path ? `<button class="action-btn" onclick="app.openFile('${result.file_path}')" title="Open File">📁</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    async scanLibrary() {
        try {
            const result = await window.electronAPI.selectFolder();
            if (!result.canceled && result.filePaths.length > 0) {
                const folderPath = result.filePaths[0];
                
                this.showLoading('Scanning music library...');
                
                this.socket.emit('scan_library', {
                    folder_path: folderPath
                });
            }
        } catch (error) {
            this.showError('Error scanning library: ' + error.message);
        }
    }

    handleScanComplete(data) {
        this.hideLoading();
        this.showSuccess(`Library scan complete! Processed ${data.total_processed} of ${data.total_files} files.`);
        this.loadLibraryStats();
        SoundEngine.play('success');
    }

    async loadLibraryStats() {
        try {
            const response = await fetch('http://localhost:5001/library/stats');
            const stats = await response.json();
            
            document.getElementById('songCount').textContent = stats.total_songs;
            document.getElementById('indexedCount').textContent = stats.indexed_songs;
            document.getElementById('librarySize').textContent = Math.round(stats.library_size / 1024 / 1024) + ' MB';
        } catch (error) {
            console.error('Error loading library stats:', error);
        }
    }

    loadLibraryData() {
        // Load library items
        // This would connect to the backend to get library data
        console.log('Loading library data...');
    }

    loadHistoryData() {
        // Load search history
        // This would connect to the backend to get history data
        console.log('Loading history data...');
    }

    togglePlayback() {
        if (this.wavesurfer) {
            this.wavesurfer.playPause();
        } else if (this.audioPlayer) {
            if (this.audioPlayer.paused) {
                this.audioPlayer.play();
                document.getElementById('playPauseBtn').textContent = '⏸️';
            } else {
                this.audioPlayer.pause();
                document.getElementById('playPauseBtn').textContent = '▶️';
            }
        }
    }

    stopPlayback() {
        if (this.wavesurfer) {
            this.wavesurfer.stop();
            document.getElementById('playPauseBtn').textContent = '▶️';
        } else if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
            document.getElementById('playPauseBtn').textContent = '▶️';
        }
    }

    playPreview(url) {
        // Implement preview playback
        console.log('Playing preview:', url);
        SoundEngine.play('click');
    }

    openExternal(url) {
        window.electronAPI.openExternal(url);
        SoundEngine.play('click');
    }

    openFile(filePath) {
        // Open file in default application
        console.log('Opening file:', filePath);
        SoundEngine.play('click');
    }

    isAudioFile(file) {
        const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'];
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return audioExtensions.includes(extension);
    }

    updateProcessingStatus(data) {
        this.updateProgress(data.progress, `Processing: ${data.stage}`);
    }

    updateSearchStatus(data) {
        this.updateProgress(data.progress, `Searching: ${data.stage}`);
    }

    updateScanStatus(data) {
        this.updateProgress(data.progress, `Scanning: ${data.current_file || data.stage}`);
    }

    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const loadingText = document.getElementById('loadingText');

        if (progressFill) progressFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = percentage + '%';
        if (loadingText && text) loadingText.textContent = text;
    }

    updateSystemStatus() {
        // Update CPU usage (mock data)
        const cpuUsage = Math.random() * 50 + 20;
        document.querySelector('.status-fill').style.width = cpuUsage + '%';
        document.querySelector('.status-value').textContent = Math.round(cpuUsage) + '%';
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingText) loadingText.textContent = message;
        if (overlay) overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    showError(message) {
        console.error('Error:', message);
        // Could implement a toast notification system here
        alert('Error: ' + message);
    }

    showSuccess(message) {
        console.log('Success:', message);
        // Could implement a toast notification system here
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'o':
                    e.preventDefault();
                    this.selectAudioFile();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const sections = ['analyzer', 'library', 'results', 'history', 'settings'];
                    const index = parseInt(e.key) - 1;
                    if (sections[index]) {
                        this.switchSection(sections[index]);
                    }
                    break;
            }
        }

        if (e.key === ' ' && this.wavesurfer) {
            e.preventDefault();
            this.togglePlayback();
        }
    }

    loadSettings() {
        // Load saved settings
        const theme = localStorage.getItem('songdna-theme') || 'cyberpunk';
        const soundEnabled = localStorage.getItem('songdna-sound') !== 'false';
        
        document.getElementById('themeSelect').value = theme;
        document.getElementById('soundEffects').checked = soundEnabled;
        
        ThemeManager.setTheme(theme);
        SoundEngine.setEnabled(soundEnabled);
    }

    saveSettings() {
        const theme = document.getElementById('themeSelect').value;
        const soundEnabled = document.getElementById('soundEffects').checked;
        
        localStorage.setItem('songdna-theme', theme);
        localStorage.setItem('songdna-sound', soundEnabled);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SongDNAApp();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.app && window.app.wavesurfer) {
        window.app.wavesurfer.drawBuffer();
    }
});