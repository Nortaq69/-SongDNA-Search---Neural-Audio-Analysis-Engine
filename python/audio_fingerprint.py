import librosa
import numpy as np
from scipy import signal
from scipy.stats import mode
import librosa.display
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class AudioFingerprinter:
    """Advanced audio fingerprinting using multiple spectral features"""
    
    def __init__(self, sr=22050, hop_length=512, n_mfcc=13):
        self.sr = sr
        self.hop_length = hop_length
        self.n_mfcc = n_mfcc
        self.scaler = StandardScaler()
        
    def extract_fingerprint(self, file_path):
        """Extract comprehensive audio fingerprint"""
        try:
            # Load audio file
            y, sr = librosa.load(file_path, sr=self.sr)
            
            # Ensure we have enough samples
            if len(y) < self.sr:  # Less than 1 second
                y = np.pad(y, (0, self.sr - len(y)), mode='constant')
            
            fingerprint = {}
            
            # 1. MFCC Features (Mel-frequency cepstral coefficients)
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=self.n_mfcc, hop_length=self.hop_length)
            fingerprint['mfcc'] = np.mean(mfcc, axis=1)  # Average across time
            fingerprint['mfcc_std'] = np.std(mfcc, axis=1)  # Standard deviation
            
            # 2. Chroma Features (Pitch class profiles)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr, hop_length=self.hop_length)
            fingerprint['chroma'] = np.mean(chroma, axis=1)
            fingerprint['chroma_std'] = np.std(chroma, axis=1)
            
            # 3. Spectral Features
            # Spectral centroid (brightness)
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=self.hop_length)[0]
            fingerprint['spectral_centroids'] = np.mean(spectral_centroids)
            fingerprint['spectral_centroids_std'] = np.std(spectral_centroids)
            
            # Spectral rolloff
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, hop_length=self.hop_length)[0]
            fingerprint['spectral_rolloff'] = np.mean(spectral_rolloff)
            fingerprint['spectral_rolloff_std'] = np.std(spectral_rolloff)
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(y, hop_length=self.hop_length)[0]
            fingerprint['zero_crossing_rate'] = np.mean(zcr)
            fingerprint['zero_crossing_rate_std'] = np.std(zcr)
            
            # Spectral bandwidth
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr, hop_length=self.hop_length)[0]
            fingerprint['spectral_bandwidth'] = np.mean(spectral_bandwidth)
            fingerprint['spectral_bandwidth_std'] = np.std(spectral_bandwidth)
            
            # 4. Rhythm and Tempo Features
            tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=self.hop_length)
            fingerprint['tempo'] = float(tempo)
            
            # Beat strength
            onset_envelope = librosa.onset.onset_strength(y=y, sr=sr, hop_length=self.hop_length)
            fingerprint['onset_strength'] = np.mean(onset_envelope)
            fingerprint['onset_strength_std'] = np.std(onset_envelope)
            
            # 5. Harmonic and Percussive Separation
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            
            # Harmonic energy
            fingerprint['harmonic_energy'] = np.sum(y_harmonic ** 2)
            fingerprint['percussive_energy'] = np.sum(y_percussive ** 2)
            fingerprint['harmonic_percussive_ratio'] = fingerprint['harmonic_energy'] / (fingerprint['percussive_energy'] + 1e-10)
            
            # 6. Key and Tonality
            chroma_cq = librosa.feature.chroma_cqt(y=y, sr=sr)
            key = self.estimate_key(chroma_cq)
            fingerprint['key'] = key
            
            # 7. Energy and Dynamics
            # RMS energy
            rms = librosa.feature.rms(y=y, hop_length=self.hop_length)[0]
            fingerprint['rms_energy'] = np.mean(rms)
            fingerprint['rms_energy_std'] = np.std(rms)
            
            # Dynamic range
            fingerprint['dynamic_range'] = np.max(rms) - np.min(rms)
            
            # 8. Mel Spectrogram Features
            mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, hop_length=self.hop_length)
            mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
            fingerprint['mel_spectral_mean'] = np.mean(mel_spec_db)
            fingerprint['mel_spectral_std'] = np.std(mel_spec_db)
            
            # 9. Contrast Features
            contrast = librosa.feature.spectral_contrast(y=y, sr=sr, hop_length=self.hop_length)
            fingerprint['spectral_contrast'] = np.mean(contrast, axis=1)
            fingerprint['spectral_contrast_std'] = np.std(contrast, axis=1)
            
            # 10. Tonnetz (Tonal centroid features)
            tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr)
            fingerprint['tonnetz'] = np.mean(tonnetz, axis=1)
            fingerprint['tonnetz_std'] = np.std(tonnetz, axis=1)
            
            # Overall energy
            fingerprint['energy'] = float(np.sum(y ** 2) / len(y))
            
            return fingerprint
            
        except Exception as e:
            print(f"Error extracting fingerprint from {file_path}: {str(e)}")
            return self._get_empty_fingerprint()
    
    def estimate_key(self, chroma):
        """Estimate musical key from chroma features"""
        try:
            # Major and minor key profiles (Krumhansl-Schmuckler)
            major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
            minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
            
            # Average chroma across time
            chroma_mean = np.mean(chroma, axis=1)
            
            # Normalize
            chroma_mean = chroma_mean / np.sum(chroma_mean)
            
            # Calculate correlation with key profiles
            key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            max_corr = -1
            estimated_key = 'C'
            
            for i in range(12):
                # Rotate profiles to match each key
                major_rotated = np.roll(major_profile, i)
                minor_rotated = np.roll(minor_profile, i)
                
                # Calculate correlations
                major_corr = np.corrcoef(chroma_mean, major_rotated)[0, 1]
                minor_corr = np.corrcoef(chroma_mean, minor_rotated)[0, 1]
                
                if major_corr > max_corr:
                    max_corr = major_corr
                    estimated_key = f"{key_names[i]} major"
                
                if minor_corr > max_corr:
                    max_corr = minor_corr
                    estimated_key = f"{key_names[i]} minor"
            
            return estimated_key
            
        except:
            return "Unknown"
    
    def _get_empty_fingerprint(self):
        """Return empty fingerprint structure"""
        return {
            'mfcc': np.zeros(self.n_mfcc),
            'mfcc_std': np.zeros(self.n_mfcc),
            'chroma': np.zeros(12),
            'chroma_std': np.zeros(12),
            'spectral_centroids': 0.0,
            'spectral_centroids_std': 0.0,
            'spectral_rolloff': 0.0,
            'spectral_rolloff_std': 0.0,
            'zero_crossing_rate': 0.0,
            'zero_crossing_rate_std': 0.0,
            'spectral_bandwidth': 0.0,
            'spectral_bandwidth_std': 0.0,
            'tempo': 0.0,
            'onset_strength': 0.0,
            'onset_strength_std': 0.0,
            'harmonic_energy': 0.0,
            'percussive_energy': 0.0,
            'harmonic_percussive_ratio': 0.0,
            'key': 'Unknown',
            'rms_energy': 0.0,
            'rms_energy_std': 0.0,
            'dynamic_range': 0.0,
            'mel_spectral_mean': 0.0,
            'mel_spectral_std': 0.0,
            'spectral_contrast': np.zeros(7),
            'spectral_contrast_std': np.zeros(7),
            'tonnetz': np.zeros(6),
            'tonnetz_std': np.zeros(6),
            'energy': 0.0
        }
    
    def create_feature_vector(self, fingerprint):
        """Create a flat feature vector from fingerprint"""
        features = []
        
        # Add all scalar features
        scalar_features = [
            'spectral_centroids', 'spectral_centroids_std',
            'spectral_rolloff', 'spectral_rolloff_std',
            'zero_crossing_rate', 'zero_crossing_rate_std',
            'spectral_bandwidth', 'spectral_bandwidth_std',
            'tempo', 'onset_strength', 'onset_strength_std',
            'harmonic_energy', 'percussive_energy', 'harmonic_percussive_ratio',
            'rms_energy', 'rms_energy_std', 'dynamic_range',
            'mel_spectral_mean', 'mel_spectral_std', 'energy'
        ]
        
        for feature in scalar_features:
            features.append(fingerprint.get(feature, 0.0))
        
        # Add array features
        array_features = ['mfcc', 'mfcc_std', 'chroma', 'chroma_std', 
                         'spectral_contrast', 'spectral_contrast_std', 
                         'tonnetz', 'tonnetz_std']
        
        for feature in array_features:
            arr = fingerprint.get(feature, [])
            if isinstance(arr, np.ndarray):
                features.extend(arr.tolist())
            elif isinstance(arr, list):
                features.extend(arr)
            else:
                features.append(0.0)
        
        return np.array(features)