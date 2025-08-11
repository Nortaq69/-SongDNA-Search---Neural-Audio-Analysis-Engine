# 🧬 SongDNA Search - Neural Audio Analysis Engine

A cyberpunk-inspired desktop application for advanced audio fingerprinting and musical similarity detection. Drag and drop any audio file to extract its unique "DNA" and find musically similar tracks using deep spectral analysis.

![SongDNA Search](assets/screenshot.png)

## ✨ Features

### 🎵 Advanced Audio Analysis
- **Multi-dimensional Fingerprinting**: MFCC, Chroma features, Spectral analysis
- **Beat & Tempo Detection**: Advanced rhythm pattern analysis
- **Harmonic Content Analysis**: Key detection and tonal analysis
- **Real-time Waveform Visualization**: Interactive audio playback with visual feedback

### 🔍 Intelligent Search Engine
- **Local Library Indexing**: Fast similarity search through your music collection
- **External API Integration**: Spotify, ACRCloud, and open music databases
- **Neural Network Matching**: Advanced similarity algorithms
- **Ranked Results**: Precision scoring based on musical composition similarity

### 🎨 Cyberpunk Interface
- **Multiple Themes**: Cyberpunk, Terminal, Synthwave, Ice
- **Animated UI Components**: Particle effects, neural network visualizations
- **Audio Feedback**: Immersive sound effects and ambient audio
- **Real-time Visualizations**: Spectrograms, MFCC coefficients, Chroma features

### ⚡ Performance Features
- **FAISS Vector Search**: Lightning-fast similarity matching
- **SQLite Database**: Efficient local storage and indexing
- **Parallel Processing**: Multi-threaded audio analysis
- **Cross-platform**: Windows and macOS support

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/songdna-search.git
   cd songdna-search
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables** (Optional for external APIs)
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ACRCLOUD_ACCESS_KEY=your_acrcloud_key
   ACRCLOUD_ACCESS_SECRET=your_acrcloud_secret
   ```

4. **Run the application**
   ```bash
   npm start
   ```

## 🎛️ Usage Guide

### Basic Workflow

1. **Launch the app** and wait for the neural network to initialize
2. **Drag & drop** an audio file (MP3, WAV, FLAC, M4A, AAC, OGG) into the analyzer
3. **Watch the analysis** as the app extracts audio DNA and visualizes features
4. **Search for similar songs** using the extracted fingerprint
5. **Browse results** with similarity scores and external links
6. **Index your music library** for faster local searches

### Keyboard Shortcuts

- `Ctrl/Cmd + O` - Open audio file
- `Ctrl/Cmd + 1-5` - Switch between sections
- `Space` - Play/pause audio
- `Escape` - Close modals

### Advanced Features

#### Library Management
- **Scan Folders**: Index entire music directories
- **Batch Processing**: Analyze thousands of tracks automatically
- **Duplicate Detection**: Find similar tracks in your collection

#### Search Modes
- **Local Only**: Search within your indexed library
- **Online Only**: Query external music databases
- **Hybrid**: Combine local and online results

#### Visualization Options
- **Spectrogram**: Frequency content over time
- **MFCC Analysis**: Mel-frequency cepstral coefficients
- **Chroma Features**: Pitch class profiles
- **Beat Structure**: Rhythm and tempo visualization

## 🔧 Technical Architecture

### Frontend (Electron + Web Technologies)
```
├── src/
│   ├── index.html          # Main application shell
│   ├── js/
│   │   ├── app.js          # Core application logic
│   │   ├── utils/          # Utility modules
│   │   └── components/     # UI components
│   └── styles/             # CSS and themes
```

### Backend (Python)
```
├── python/
│   ├── app.py              # Flask-SocketIO server
│   ├── audio_fingerprint.py # Audio analysis engine
│   ├── similarity_engine.py # Search algorithms
│   └── external_apis.py    # API integrations
```

### Key Technologies
- **Audio Processing**: librosa, numpy, scipy
- **Machine Learning**: scikit-learn, FAISS
- **Database**: SQLite with FTS5
- **UI Framework**: Electron, Chart.js, WaveSurfer.js
- **Real-time Communication**: Socket.IO
- **Visualization**: Three.js, GSAP animations

## 🎨 Customization

### Themes
The app includes four built-in themes:
- **Cyberpunk** (default): Cyan and magenta neon
- **Terminal**: Classic green monochrome
- **Synthwave**: Retro purple and pink
- **Ice**: Cool blue and white

### Audio Settings
Configure analysis parameters:
- **MFCC Coefficients**: 12-20 (default: 13)
- **Hop Length**: 256-1024 samples (default: 512)
- **Sample Rate**: 22.05kHz, 44.1kHz, 48kHz
- **Similarity Threshold**: 0.1-1.0 (default: 0.7)

### External APIs

#### Spotify Integration
```javascript
// Add your Spotify credentials to .env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

#### ACRCloud Setup
```javascript
// Register at ACRCloud and add credentials
ACRCLOUD_ACCESS_KEY=your_access_key
ACRCLOUD_ACCESS_SECRET=your_secret_key
```

## 📊 Performance Optimization

### Database Optimization
- **Indexing**: Automatic FAISS index building
- **Caching**: LRU cache for frequent queries
- **Batch Operations**: Efficient bulk insertions

### Memory Management
- **Streaming**: Large file processing in chunks
- **Garbage Collection**: Automatic cleanup of audio buffers
- **Resource Pooling**: Reuse of analysis components

### Search Performance
- **Vector Quantization**: PCA dimensionality reduction
- **Hierarchical Clustering**: Multi-level search optimization
- **Parallel Processing**: Multi-threaded similarity calculation

## 🛠️ Development

### Building from Source
```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Package for distribution
npm run dist
```

### Adding New Features
1. **Audio Features**: Extend `audio_fingerprint.py`
2. **UI Components**: Add to `src/js/components/`
3. **Themes**: Modify `src/styles/cyberpunk.css`
4. **APIs**: Extend `external_apis.py`

### Testing
```bash
# Run frontend tests
npm test

# Run Python tests
cd python && python -m pytest

# Integration tests
npm run test:integration
```

## 🐛 Troubleshooting

### Common Issues

**Audio files not loading**
- Check file format support (MP3, WAV, FLAC, M4A, AAC, OGG)
- Verify file isn't corrupted
- Ensure sufficient disk space

**Python backend not connecting**
- Check if port 5000 is available
- Verify Python dependencies are installed
- Look for error messages in the console

**Slow performance**
- Reduce MFCC coefficients to 12
- Lower sample rate to 22.05kHz
- Clear browser cache and restart

**External APIs not working**
- Verify API credentials in .env file
- Check internet connection
- Ensure API quotas aren't exceeded

### Performance Tuning

**For large libraries (10,000+ tracks)**
```python
# Increase batch size in similarity_engine.py
BATCH_SIZE = 1000

# Use PCA for dimensionality reduction
USE_PCA = True
PCA_COMPONENTS = 50
```

**For low-end hardware**
```javascript
// Reduce particle count in background-effects.js
const particleCount = 20; // Default: 50

// Disable advanced visualizations
const ENABLE_PARTICLES = false;
```

## 📝 API Reference

### Audio Fingerprint Format
```javascript
{
  mfcc: [13 coefficients],
  chroma: [12 pitch classes],
  spectral_centroids: float,
  spectral_rolloff: float,
  zero_crossing_rate: float,
  tempo: float,
  key: string,
  energy: float,
  harmonic_energy: float,
  percussive_energy: float
}
```

### Search Result Format
```javascript
{
  title: string,
  artist: string,
  album: string,
  similarity: float (0-1),
  source: "local" | "spotify" | "acrcloud",
  file_path?: string,
  spotify_url?: string,
  preview_url?: string,
  detailed_similarity: {
    mfcc: float,
    chroma: float,
    tempo: float,
    energy: float,
    overall: float
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### Code Style
- **JavaScript**: ESLint with Airbnb config
- **Python**: Black formatter with PEP 8
- **CSS**: BEM methodology
- **Commits**: Conventional Commits format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **librosa** - Audio analysis library
- **FAISS** - Similarity search engine
- **Chart.js** - Data visualization
- **WaveSurfer.js** - Audio waveform rendering
- **Electron** - Cross-platform desktop framework

## 🔗 Links

- [Documentation](https://songdna-search.readthedocs.io)
- [Issue Tracker](https://github.com/yourusername/songdna-search/issues)
- [Discord Community](https://discord.gg/songdna)
- [Feature Requests](https://github.com/yourusername/songdna-search/discussions)

---

<div align="center">
  <strong>🧬 Discover the DNA of Music 🧬</strong>
  <br>
  <sub>Built with ❤️ for music lovers and audio enthusiasts</sub>
</div>