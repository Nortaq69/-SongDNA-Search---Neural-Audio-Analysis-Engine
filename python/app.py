# -*- coding: utf-8 -*-
import os
import sys
import json
import threading
import time
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit

# Set console encoding for Windows
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
import librosa
import numpy as np
from scipy.spatial.distance import cosine, euclidean
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import soundfile as sf
from mutagen import File
import hashlib
from pathlib import Path
import sqlite3
from datetime import datetime
import joblib
from audio_fingerprint import AudioFingerprinter
from similarity_engine import SimilarityEngine
from external_apis import ExternalAPIManager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'songdna_neural_key_2024'
socketio = SocketIO(app, cors_allowed_origins="*")

# Database setup
def init_database():
    conn = sqlite3.connect('songdna.db')
    cursor = conn.cursor()
    
    # Songs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS songs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT UNIQUE,
            title TEXT,
            artist TEXT,
            album TEXT,
            duration REAL,
            file_hash TEXT UNIQUE,
            fingerprint_data TEXT,
            mfcc_features TEXT,
            chroma_features TEXT,
            spectral_features TEXT,
            tempo REAL,
            key_signature TEXT,
            energy REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Search history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_file TEXT,
            results TEXT,
            search_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

init_database()

# Initialize components after database
fingerprinter = AudioFingerprinter()
similarity_engine = SimilarityEngine()
api_manager = ExternalAPIManager()

@app.route('/health')
def health_check():
    return jsonify({'status': 'online', 'service': 'SongDNA Neural Backend'})

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'message': 'Neural network ready', 'status': 'online'})

@socketio.on('process_audio')
def handle_process_audio(data):
    try:
        file_path = data['file_path']
        emit('processing_status', {'stage': 'loading', 'progress': 10})
        
        # Extract audio fingerprint
        fingerprint_data = fingerprinter.extract_fingerprint(file_path)
        emit('processing_status', {'stage': 'analysis', 'progress': 50})
        
        # Get metadata
        metadata = extract_metadata(file_path)
        
        # Store in database
        store_audio_data(file_path, fingerprint_data, metadata)
        emit('processing_status', {'stage': 'complete', 'progress': 100})
        
        # Send results back
        emit('audio_processed', {
            'fingerprint': fingerprint_data,
            'metadata': metadata,
            'file_path': file_path
        })
        
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        emit('error', {'message': f'Error processing audio: {str(e)}'})

@socketio.on('search_similar')
def handle_search_similar(data):
    try:
        source_fingerprint = data['fingerprint']
        search_mode = data.get('search_mode', 'hybrid')
        max_results = data.get('max_results', 20)
        threshold = data.get('threshold', 0.7)
        
        emit('search_status', {'stage': 'searching', 'progress': 20})
        
        # Search local database
        local_results = similarity_engine.search_local(
            source_fingerprint, max_results, threshold
        )
        
        emit('search_status', {'stage': 'external_apis', 'progress': 60})
        
        # Search external APIs if enabled
        external_results = []
        if search_mode in ['online', 'hybrid']:
            external_results = api_manager.search_external(
                source_fingerprint, max_results
            )
        
        # Combine and rank results
        all_results = combine_and_rank_results(local_results, external_results)
        
        # Store search history
        store_search_history(data.get('source_file'), all_results)
        
        emit('search_status', {'stage': 'complete', 'progress': 100})
        emit('search_complete', {'results': all_results})
        
    except Exception as e:
        print(f"Error in similarity search: {str(e)}")
        emit('error', {'message': f'Search error: {str(e)}'})

@socketio.on('scan_library')
def handle_scan_library(data):
    try:
        folder_path = data['folder_path']
        emit('scan_status', {'stage': 'scanning', 'progress': 0})
        
        # Get all audio files
        audio_extensions = {'.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'}
        audio_files = []
        
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if Path(file).suffix.lower() in audio_extensions:
                    audio_files.append(os.path.join(root, file))
        
        total_files = len(audio_files)
        processed_files = 0
        
        for i, file_path in enumerate(audio_files):
            try:
                # Check if already processed
                if not is_file_processed(file_path):
                    fingerprint_data = fingerprinter.extract_fingerprint(file_path)
                    metadata = extract_metadata(file_path)
                    store_audio_data(file_path, fingerprint_data, metadata)
                    processed_files += 1
                
                # Update progress
                progress = int((i + 1) / total_files * 100)
                emit('scan_status', {
                    'stage': 'processing',
                    'progress': progress,
                    'current_file': os.path.basename(file_path),
                    'processed': processed_files,
                    'total': total_files
                })
                
            except Exception as e:
                print(f"Error processing {file_path}: {str(e)}")
                continue
        
        emit('scan_complete', {
            'total_processed': processed_files,
            'total_files': total_files
        })
        
    except Exception as e:
        print(f"Error scanning library: {str(e)}")
        emit('error', {'message': f'Library scan error: {str(e)}'})

def extract_metadata(file_path):
    """Extract metadata from audio file"""
    try:
        # Get file info using mutagen
        audio_file = File(file_path)
        metadata = {
            'title': 'Unknown',
            'artist': 'Unknown',
            'album': 'Unknown',
            'duration': 0,
            'file_size': os.path.getsize(file_path)
        }
        
        if audio_file:
            metadata['title'] = str(audio_file.get('TIT2', ['Unknown'])[0]) if audio_file.get('TIT2') else 'Unknown'
            metadata['artist'] = str(audio_file.get('TPE1', ['Unknown'])[0]) if audio_file.get('TPE1') else 'Unknown'
            metadata['album'] = str(audio_file.get('TALB', ['Unknown'])[0]) if audio_file.get('TALB') else 'Unknown'
            
            # Get duration
            if hasattr(audio_file, 'info') and hasattr(audio_file.info, 'length'):
                metadata['duration'] = audio_file.info.length
        
        return metadata
        
    except Exception as e:
        print(f"Error extracting metadata: {str(e)}")
        return {
            'title': os.path.basename(file_path),
            'artist': 'Unknown',
            'album': 'Unknown',
            'duration': 0,
            'file_size': os.path.getsize(file_path) if os.path.exists(file_path) else 0
        }

def store_audio_data(file_path, fingerprint_data, metadata):
    """Store audio fingerprint and metadata in database"""
    try:
        # Calculate file hash
        file_hash = calculate_file_hash(file_path)
        
        conn = sqlite3.connect('songdna.db')
        cursor = conn.cursor()
        
        # Convert numpy arrays to JSON strings
        fingerprint_json = json.dumps({
            'mfcc': fingerprint_data['mfcc'].tolist() if 'mfcc' in fingerprint_data else [],
            'chroma': fingerprint_data['chroma'].tolist() if 'chroma' in fingerprint_data else [],
            'spectral_centroids': fingerprint_data['spectral_centroids'].tolist() if 'spectral_centroids' in fingerprint_data else [],
            'spectral_rolloff': fingerprint_data['spectral_rolloff'].tolist() if 'spectral_rolloff' in fingerprint_data else [],
            'zero_crossing_rate': fingerprint_data['zero_crossing_rate'].tolist() if 'zero_crossing_rate' in fingerprint_data else [],
            'tempo': fingerprint_data.get('tempo', 0),
            'key': fingerprint_data.get('key', 'Unknown'),
            'energy': fingerprint_data.get('energy', 0)
        })
        
        cursor.execute('''
            INSERT OR REPLACE INTO songs 
            (file_path, title, artist, album, duration, file_hash, fingerprint_data, 
             tempo, key_signature, energy, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            file_path,
            metadata['title'],
            metadata['artist'],
            metadata['album'],
            metadata['duration'],
            file_hash,
            fingerprint_json,
            fingerprint_data.get('tempo', 0),
            fingerprint_data.get('key', 'Unknown'),
            fingerprint_data.get('energy', 0),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"Error storing audio data: {str(e)}")

def calculate_file_hash(file_path):
    """Calculate SHA256 hash of file"""
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

def is_file_processed(file_path):
    """Check if file is already processed"""
    try:
        file_hash = calculate_file_hash(file_path)
        conn = sqlite3.connect('songdna.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM songs WHERE file_hash = ?', (file_hash,))
        result = cursor.fetchone()
        conn.close()
        return result is not None
    except:
        return False

def combine_and_rank_results(local_results, external_results):
    """Combine and rank results from different sources"""
    all_results = []
    
    # Add local results
    for result in local_results:
        result['source'] = 'local'
        all_results.append(result)
    
    # Add external results
    for result in external_results:
        result['source'] = 'external'
        all_results.append(result)
    
    # Sort by similarity score (descending)
    all_results.sort(key=lambda x: x.get('similarity', 0), reverse=True)
    
    return all_results

def store_search_history(source_file, results):
    """Store search history in database"""
    try:
        conn = sqlite3.connect('songdna.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO search_history (source_file, results)
            VALUES (?, ?)
        ''', (source_file, json.dumps(results)))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"Error storing search history: {str(e)}")

@app.route('/library/stats')
def get_library_stats():
    """Get library statistics"""
    try:
        conn = sqlite3.connect('songdna.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM songs')
        total_songs = cursor.fetchone()[0]
        
        cursor.execute('SELECT SUM(LENGTH(fingerprint_data)) FROM songs WHERE fingerprint_data IS NOT NULL')
        indexed_count = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return jsonify({
            'total_songs': total_songs,
            'indexed_songs': indexed_count,
            'library_size': 0  # Calculate actual size if needed
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("SongDNA Neural Backend Starting...")
    print("Audio fingerprinting engine online")
    print("Similarity search ready")
    print("Listening on http://localhost:5001")
    
    socketio.run(app, host='localhost', port=5001, debug=False)