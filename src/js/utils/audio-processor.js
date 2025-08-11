// Audio Processing Utilities
class AudioProcessor {
    static audioContext = null;
    static analyser = null;
    static source = null;

    static init() {
        this.setupAudioContext();
        console.log('🎵 Audio Processor initialized');
    }

    static setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
        } catch (error) {
            console.warn('Audio Context not supported:', error);
        }
    }

    static async loadAudioFile(file) {
        if (!this.audioContext) return null;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error('Error loading audio file:', error);
            return null;
        }
    }

    static analyzeAudioBuffer(audioBuffer) {
        if (!audioBuffer) return null;

        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        
        return {
            duration: audioBuffer.duration,
            sampleRate: sampleRate,
            channels: audioBuffer.numberOfChannels,
            samples: channelData.length,
            rms: this.calculateRMS(channelData),
            peaks: this.findPeaks(channelData),
            zerocrossings: this.countZeroCrossings(channelData),
            spectralCentroid: this.calculateSpectralCentroid(channelData, sampleRate),
            tempo: this.estimateTempo(channelData, sampleRate)
        };
    }

    static calculateRMS(data) {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i] * data[i];
        }
        return Math.sqrt(sum / data.length);
    }

    static findPeaks(data, threshold = 0.5) {
        const peaks = [];
        for (let i = 1; i < data.length - 1; i++) {
            if (Math.abs(data[i]) > threshold && 
                Math.abs(data[i]) > Math.abs(data[i - 1]) && 
                Math.abs(data[i]) > Math.abs(data[i + 1])) {
                peaks.push({ index: i, value: data[i] });
            }
        }
        return peaks;
    }

    static countZeroCrossings(data) {
        let crossings = 0;
        for (let i = 1; i < data.length; i++) {
            if ((data[i - 1] >= 0) !== (data[i] >= 0)) {
                crossings++;
            }
        }
        return crossings;
    }

    static calculateSpectralCentroid(data, sampleRate) {
        const fft = this.computeFFT(data);
        let weightedSum = 0;
        let magnitudeSum = 0;

        for (let i = 0; i < fft.length / 2; i++) {
            const magnitude = Math.sqrt(fft[i].real * fft[i].real + fft[i].imag * fft[i].imag);
            const frequency = (i * sampleRate) / fft.length;
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }

        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    static estimateTempo(data, sampleRate) {
        // Simple onset detection for tempo estimation
        const windowSize = 1024;
        const hopSize = 512;
        const onsets = [];

        for (let i = 0; i < data.length - windowSize; i += hopSize) {
            const window = data.slice(i, i + windowSize);
            const energy = this.calculateRMS(window);
            
            if (onsets.length === 0 || energy > onsets[onsets.length - 1] * 1.2) {
                onsets.push(energy);
            }
        }

        // Calculate intervals between onsets
        const intervals = [];
        for (let i = 1; i < onsets.length; i++) {
            intervals.push((hopSize / sampleRate) * i);
        }

        // Find most common interval (simplified)
        if (intervals.length > 0) {
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            return 60 / avgInterval; // Convert to BPM
        }

        return 120; // Default BPM
    }

    static computeFFT(data) {
        // Simplified FFT implementation
        const N = data.length;
        const fft = new Array(N);

        for (let k = 0; k < N; k++) {
            let real = 0;
            let imag = 0;

            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += data[n] * Math.cos(angle);
                imag += data[n] * Math.sin(angle);
            }

            fft[k] = { real, imag };
        }

        return fft;
    }

    static extractFeatures(audioBuffer) {
        if (!audioBuffer) return null;

        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        // Extract various audio features
        const features = {
            // Time-domain features
            rms: this.calculateRMS(channelData),
            zeroCrossingRate: this.countZeroCrossings(channelData) / channelData.length,
            
            // Frequency-domain features
            spectralCentroid: this.calculateSpectralCentroid(channelData, sampleRate),
            spectralRolloff: this.calculateSpectralRolloff(channelData, sampleRate),
            spectralFlux: this.calculateSpectralFlux(channelData),
            
            // Rhythm features
            tempo: this.estimateTempo(channelData, sampleRate),
            rhythmStrength: this.calculateRhythmStrength(channelData, sampleRate),
            
            // Harmonic features
            harmonicity: this.calculateHarmonicity(channelData, sampleRate),
            inharmonicity: this.calculateInharmonicity(channelData, sampleRate),
            
            // Other features
            energy: Math.log(this.calculateRMS(channelData) + 1e-10),
            dynamicRange: this.calculateDynamicRange(channelData),
            attack: this.calculateAttackTime(channelData, sampleRate),
            decay: this.calculateDecayTime(channelData, sampleRate)
        };

        return features;
    }

    static calculateSpectralRolloff(data, sampleRate, threshold = 0.85) {
        const fft = this.computeFFT(data);
        const magnitudes = fft.slice(0, fft.length / 2).map(bin => 
            Math.sqrt(bin.real * bin.real + bin.imag * bin.imag)
        );

        const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
        const targetEnergy = totalEnergy * threshold;

        let cumulativeEnergy = 0;
        for (let i = 0; i < magnitudes.length; i++) {
            cumulativeEnergy += magnitudes[i] * magnitudes[i];
            if (cumulativeEnergy >= targetEnergy) {
                return (i * sampleRate) / (2 * magnitudes.length);
            }
        }

        return sampleRate / 2; // Nyquist frequency
    }

    static calculateSpectralFlux(data) {
        const windowSize = 1024;
        const hopSize = 512;
        let flux = 0;
        let prevSpectrum = null;

        for (let i = 0; i < data.length - windowSize; i += hopSize) {
            const window = data.slice(i, i + windowSize);
            const fft = this.computeFFT(window);
            const spectrum = fft.slice(0, fft.length / 2).map(bin => 
                Math.sqrt(bin.real * bin.real + bin.imag * bin.imag)
            );

            if (prevSpectrum) {
                for (let j = 0; j < spectrum.length; j++) {
                    const diff = spectrum[j] - prevSpectrum[j];
                    flux += Math.max(0, diff);
                }
            }

            prevSpectrum = spectrum;
        }

        return flux;
    }

    static calculateRhythmStrength(data, sampleRate) {
        const tempo = this.estimateTempo(data, sampleRate);
        const beatInterval = 60 / tempo; // seconds per beat
        const samplesPerBeat = beatInterval * sampleRate;

        // Calculate autocorrelation at beat interval
        let correlation = 0;
        const maxLag = Math.min(samplesPerBeat * 4, data.length / 2);

        for (let lag = samplesPerBeat * 0.8; lag < samplesPerBeat * 1.2; lag++) {
            let sum = 0;
            for (let i = 0; i < data.length - lag; i++) {
                sum += data[i] * data[i + Math.round(lag)];
            }
            correlation = Math.max(correlation, sum / (data.length - lag));
        }

        return Math.max(0, Math.min(1, correlation));
    }

    static calculateHarmonicity(data, sampleRate) {
        const fft = this.computeFFT(data);
        const magnitudes = fft.slice(0, fft.length / 2).map(bin => 
            Math.sqrt(bin.real * bin.real + bin.imag * bin.imag)
        );

        // Find fundamental frequency
        let maxMag = 0;
        let fundamentalBin = 0;
        for (let i = 1; i < magnitudes.length; i++) {
            if (magnitudes[i] > maxMag) {
                maxMag = magnitudes[i];
                fundamentalBin = i;
            }
        }

        if (fundamentalBin === 0) return 0;

        // Calculate harmonic strength
        let harmonicEnergy = 0;
        let totalEnergy = 0;

        for (let i = 0; i < magnitudes.length; i++) {
            totalEnergy += magnitudes[i] * magnitudes[i];
            
            // Check if this bin is near a harmonic
            for (let h = 1; h <= 10; h++) {
                const harmonicBin = fundamentalBin * h;
                if (Math.abs(i - harmonicBin) <= 2) {
                    harmonicEnergy += magnitudes[i] * magnitudes[i];
                    break;
                }
            }
        }

        return totalEnergy > 0 ? harmonicEnergy / totalEnergy : 0;
    }

    static calculateInharmonicity(data, sampleRate) {
        return 1 - this.calculateHarmonicity(data, sampleRate);
    }

    static calculateDynamicRange(data) {
        const windowSize = Math.floor(data.length / 100); // 1% windows
        const energies = [];

        for (let i = 0; i < data.length - windowSize; i += windowSize) {
            const window = data.slice(i, i + windowSize);
            energies.push(this.calculateRMS(window));
        }

        const maxEnergy = Math.max(...energies);
        const minEnergy = Math.min(...energies.filter(e => e > 0));

        return maxEnergy > 0 ? 20 * Math.log10(maxEnergy / (minEnergy + 1e-10)) : 0;
    }

    static calculateAttackTime(data, sampleRate) {
        const threshold = this.calculateRMS(data) * 0.1;
        const maxValue = Math.max(...data.map(Math.abs));
        const peakThreshold = maxValue * 0.9;

        let attackStart = -1;
        let attackEnd = -1;

        for (let i = 0; i < data.length; i++) {
            if (attackStart === -1 && Math.abs(data[i]) > threshold) {
                attackStart = i;
            }
            if (attackStart !== -1 && Math.abs(data[i]) > peakThreshold) {
                attackEnd = i;
                break;
            }
        }

        if (attackStart !== -1 && attackEnd !== -1) {
            return (attackEnd - attackStart) / sampleRate;
        }

        return 0;
    }

    static calculateDecayTime(data, sampleRate) {
        const maxValue = Math.max(...data.map(Math.abs));
        const maxIndex = data.findIndex(d => Math.abs(d) === maxValue);
        
        if (maxIndex === -1) return 0;

        const decayThreshold = maxValue * 0.1;
        
        for (let i = maxIndex; i < data.length; i++) {
            if (Math.abs(data[i]) < decayThreshold) {
                return (i - maxIndex) / sampleRate;
            }
        }

        return (data.length - maxIndex) / sampleRate;
    }

    static createFingerprint(audioBuffer) {
        if (!audioBuffer) return null;

        const features = this.extractFeatures(audioBuffer);
        const channelData = audioBuffer.getChannelData(0);
        
        // Create a unique fingerprint hash
        const fingerprint = {
            ...features,
            hash: this.generateAudioHash(channelData),
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            timestamp: Date.now()
        };

        return fingerprint;
    }

    static generateAudioHash(data) {
        // Simple hash based on audio characteristics
        let hash = 0;
        const step = Math.floor(data.length / 32); // 32 sample points
        
        for (let i = 0; i < data.length; i += step) {
            const value = Math.floor(data[i] * 1000000);
            hash = ((hash << 5) - hash + value) & 0xffffffff;
        }
        
        return Math.abs(hash).toString(16);
    }

    static compareFingerprints(fp1, fp2) {
        if (!fp1 || !fp2) return 0;

        const weights = {
            spectralCentroid: 0.15,
            spectralRolloff: 0.1,
            spectralFlux: 0.1,
            tempo: 0.2,
            rhythmStrength: 0.15,
            harmonicity: 0.1,
            energy: 0.1,
            dynamicRange: 0.1
        };

        let similarity = 0;
        let totalWeight = 0;

        for (const [feature, weight] of Object.entries(weights)) {
            if (fp1[feature] !== undefined && fp2[feature] !== undefined) {
                const diff = Math.abs(fp1[feature] - fp2[feature]);
                const maxVal = Math.max(fp1[feature], fp2[feature], 1);
                const featureSim = 1 - (diff / maxVal);
                similarity += featureSim * weight;
                totalWeight += weight;
            }
        }

        return totalWeight > 0 ? similarity / totalWeight : 0;
    }

    static destroy() {
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}