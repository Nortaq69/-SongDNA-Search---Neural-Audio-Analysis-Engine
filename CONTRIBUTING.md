# Contributing to SongDNA Search

Thank you for your interest in contributing to SongDNA Search! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (3.8 or higher)
- Git
- Basic knowledge of JavaScript, Python, and audio processing

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/songdna-search.git
   cd songdna-search
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up development environment**
   ```bash
   cp python/.env.example python/.env
   # Edit .env with your API keys (optional for basic development)
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

## 🎯 How to Contribute

### Reporting Issues
- Use the [GitHub Issue Tracker](https://github.com/yourusername/songdna-search/issues)
- Search existing issues before creating new ones
- Provide detailed reproduction steps
- Include system information and error logs

### Suggesting Features
- Open a [Discussion](https://github.com/yourusername/songdna-search/discussions) first
- Describe the use case and expected behavior
- Consider backward compatibility
- Provide mockups or examples if applicable

### Code Contributions

#### Areas We Need Help With
- **Audio Processing**: New fingerprinting algorithms
- **UI/UX**: Theme improvements and accessibility
- **Performance**: Optimization and caching strategies
- **External APIs**: New music service integrations
- **Documentation**: Tutorials and API documentation
- **Testing**: Unit tests and integration tests

#### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards (see below)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run test:python
   npm run lint
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new audio fingerprinting algorithm"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### JavaScript/TypeScript
- Use ESLint with Airbnb configuration
- Prefer `const` and `let` over `var`
- Use arrow functions for callbacks
- Document complex functions with JSDoc

```javascript
/**
 * Calculates audio similarity between two fingerprints
 * @param {Object} fp1 - First fingerprint
 * @param {Object} fp2 - Second fingerprint
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(fp1, fp2) {
  // Implementation
}
```

### Python
- Follow PEP 8 style guide
- Use Black formatter
- Type hints for function parameters and returns
- Docstrings for all public functions

```python
def extract_features(audio_data: np.ndarray, sample_rate: int) -> Dict[str, float]:
    """
    Extract audio features from raw audio data.
    
    Args:
        audio_data: Raw audio samples
        sample_rate: Audio sample rate in Hz
        
    Returns:
        Dictionary containing extracted features
    """
    # Implementation
```

### CSS
- Use BEM methodology for class naming
- Organize by components
- Use CSS custom properties for theming
- Mobile-first responsive design

```css
/* Component Block */
.cyber-button {
  /* Element */
  &__text {
    /* Modifier */
    &--highlighted {
      color: var(--cyber-primary);
    }
  }
}
```

### Git Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions or modifications

## 🧪 Testing

### Frontend Tests
```bash
# Run all frontend tests
npm test

# Run specific test file
npm test -- src/js/utils/audio-processor.test.js

# Run with coverage
npm run test:coverage
```

### Backend Tests
```bash
# Run Python tests
cd python
python -m pytest

# Run with coverage
python -m pytest --cov=.

# Run specific test
python -m pytest tests/test_audio_fingerprint.py
```

### Integration Tests
```bash
# Run full integration test suite
npm run test:integration

# Test specific workflow
npm run test:integration -- --grep "audio processing"
```

## 📁 Project Structure

```
songdna-search/
├── src/                    # Frontend source code
│   ├── js/
│   │   ├── app.js         # Main application
│   │   ├── utils/         # Utility functions
│   │   └── components/    # UI components
│   ├── styles/            # CSS stylesheets
│   └── index.html         # Main HTML file
├── python/                # Backend source code
│   ├── app.py            # Flask server
│   ├── audio_fingerprint.py
│   ├── similarity_engine.py
│   └── external_apis.py
├── assets/               # Static assets
├── tests/                # Test files
└── docs/                 # Documentation
```

## 🎨 Adding New Themes

1. **Define theme colors in `theme-manager.js`**
   ```javascript
   newTheme: {
     name: 'New Theme',
     primary: '#color1',
     secondary: '#color2',
     accent: '#color3',
     warning: '#color4',
     danger: '#color5'
   }
   ```

2. **Add theme-specific styles in `cyberpunk.css`**
   ```css
   .theme-newtheme {
     --custom-property: value;
   }
   ```

3. **Update theme selector in HTML**
   ```html
   <option value="newtheme">New Theme</option>
   ```

## 🔊 Adding Audio Features

1. **Extend `AudioFingerprinter` class**
   ```python
   def extract_new_feature(self, audio_data):
       # Implementation
       return feature_value
   ```

2. **Update fingerprint structure**
   ```python
   fingerprint['new_feature'] = self.extract_new_feature(y)
   ```

3. **Add visualization (optional)**
   ```javascript
   static updateNewFeature(fingerprint) {
     // Add chart or visualization
   }
   ```

## 🌐 Adding External APIs

1. **Create API class in `external_apis.py`**
   ```python
   class NewMusicAPI:
       def __init__(self, api_key):
           self.api_key = api_key
       
       def search(self, fingerprint):
           # Implementation
           return results
   ```

2. **Integrate with main API manager**
   ```python
   def search_external(self, fingerprint_data, max_results=10):
       # Add new API to search pipeline
   ```

3. **Add environment variables**
   ```bash
   NEW_API_KEY=your_api_key
   NEW_API_SECRET=your_secret
   ```

## 📚 Documentation

### Code Documentation
- Use JSDoc for JavaScript functions
- Use docstrings for Python functions
- Include examples in documentation
- Document complex algorithms

### API Documentation
- Update README.md for public APIs
- Include request/response examples
- Document error conditions
- Provide integration examples

### User Documentation
- Update user guide for new features
- Include screenshots and videos
- Provide troubleshooting steps
- Maintain FAQ section

## 🐛 Debugging

### Frontend Debugging
```javascript
// Enable debug mode
localStorage.setItem('songdna-debug', 'true');

// Use browser dev tools
console.log('Debug info:', debugData);
```

### Backend Debugging
```python
# Enable Flask debug mode
export FLASK_DEBUG=1

# Add logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Common Issues
- **Audio not loading**: Check file format and codec support
- **Slow performance**: Profile with browser dev tools
- **Memory leaks**: Monitor memory usage during long sessions
- **API errors**: Check network connectivity and API quotas

## 🔐 Security Guidelines

- Never commit API keys or secrets
- Validate all user inputs
- Sanitize file paths and names
- Use HTTPS for external API calls
- Implement rate limiting for APIs

## 📋 Pull Request Checklist

Before submitting a pull request:

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No sensitive data in commits
- [ ] Performance impact considered
- [ ] Backward compatibility maintained

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for major contributions
- Special mentions for innovative features
- Community showcase for exemplary work

## 📞 Getting Help

- **GitHub Discussions**: For questions and ideas
- **Discord**: Real-time chat with maintainers
- **Email**: security@songdna-search.com (for security issues)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make SongDNA Search better! 🎵✨