import numpy as np
import sqlite3
import json
from scipy.spatial.distance import cosine, euclidean
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import faiss
from audio_fingerprint import AudioFingerprinter

class SimilarityEngine:
    """Advanced similarity search engine for audio fingerprints"""
    
    def __init__(self):
        self.fingerprinter = AudioFingerprinter()
        self.scaler = StandardScaler()
        self.index = None
        self.feature_dim = None
        self.indexed_songs = []
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize FAISS index for fast similarity search"""
        try:
            # Load existing songs and build index
            songs = self._load_all_songs()
            if songs:
                self._build_faiss_index(songs)
        except Exception as e:
            print(f"Error initializing index: {str(e)}")
    
    def _load_all_songs(self):
        """Load all songs from database"""
        try:
            conn = sqlite3.connect('songdna.db')
            cursor = conn.cursor()
            
            # Check if table exists first
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='songs'
            """)
            
            if not cursor.fetchone():
                conn.close()
                return []  # Table doesn't exist yet
                
            cursor.execute('''
                SELECT id, file_path, title, artist, album, fingerprint_data, tempo, key_signature, energy
                FROM songs 
                WHERE fingerprint_data IS NOT NULL
            ''')
            songs = cursor.fetchall()
            conn.close()
            return songs
        except Exception as e:
            print(f"Error loading songs: {str(e)}")
            return []
    
    def _build_faiss_index(self, songs):
        """Build FAISS index for fast similarity search"""
        try:
            features = []
            self.indexed_songs = []
            
            for song in songs:
                try:
                    # Parse fingerprint data
                    fingerprint_data = json.loads(song[5])  # fingerprint_data column
                    
                    # Convert back to proper format
                    fingerprint = self._parse_fingerprint(fingerprint_data)
                    
                    # Create feature vector
                    feature_vector = self.fingerprinter.create_feature_vector(fingerprint)
                    features.append(feature_vector)
                    
                    # Store song info
                    self.indexed_songs.append({
                        'id': song[0],
                        'file_path': song[1],
                        'title': song[2],
                        'artist': song[3],
                        'album': song[4],
                        'tempo': song[6],
                        'key': song[7],
                        'energy': song[8],
                        'fingerprint': fingerprint
                    })
                    
                except Exception as e:
                    print(f"Error processing song {song[1]}: {str(e)}")
                    continue
            
            if features:
                features = np.array(features).astype('float32')
                
                # Normalize features
                features = self.scaler.fit_transform(features)
                
                # Build FAISS index
                self.feature_dim = features.shape[1]
                self.index = faiss.IndexFlatIP(self.feature_dim)  # Inner product (cosine similarity)
                
                # Normalize for cosine similarity
                faiss.normalize_L2(features)
                self.index.add(features)
                
                print(f"Built FAISS index with {len(features)} songs, {self.feature_dim} dimensions")
            
        except Exception as e:
            print(f"Error building FAISS index: {str(e)}")
    
    def _parse_fingerprint(self, fingerprint_data):
        """Parse fingerprint data from JSON format"""
        fingerprint = {}
        
        # Convert lists back to numpy arrays
        array_features = ['mfcc', 'chroma', 'spectral_centroids', 'spectral_rolloff', 'zero_crossing_rate']
        for feature in array_features:
            if feature in fingerprint_data and fingerprint_data[feature]:
                fingerprint[feature] = np.array(fingerprint_data[feature])
        
        # Add scalar features
        scalar_features = ['tempo', 'energy']
        for feature in scalar_features:
            fingerprint[feature] = fingerprint_data.get(feature, 0.0)
        
        fingerprint['key'] = fingerprint_data.get('key', 'Unknown')
        
        return fingerprint
    
    def search_local(self, query_fingerprint, max_results=20, threshold=0.7):
        """Search for similar songs in local database"""
        try:
            if not self.index or not self.indexed_songs:
                return []
            
            # Create feature vector from query
            query_vector = self.fingerprinter.create_feature_vector(query_fingerprint)
            query_vector = query_vector.reshape(1, -1).astype('float32')
            
            # Normalize query
            query_vector = self.scaler.transform(query_vector)
            faiss.normalize_L2(query_vector)
            
            # Search
            k = min(max_results * 2, len(self.indexed_songs))  # Get more results to filter
            similarities, indices = self.index.search(query_vector, k)
            
            results = []
            for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
                if similarity >= threshold:
                    song = self.indexed_songs[idx]
                    
                    # Calculate additional similarity metrics
                    detailed_similarity = self._calculate_detailed_similarity(
                        query_fingerprint, song['fingerprint']
                    )
                    
                    result = {
                        'title': song['title'],
                        'artist': song['artist'],
                        'album': song['album'],
                        'file_path': song['file_path'],
                        'similarity': float(similarity),
                        'detailed_similarity': detailed_similarity,
                        'tempo': song['tempo'],
                        'key': song['key'],
                        'energy': song['energy'],
                        'rank': i + 1
                    }
                    results.append(result)
            
            # Sort by similarity and limit results
            results.sort(key=lambda x: x['similarity'], reverse=True)
            return results[:max_results]
            
        except Exception as e:
            print(f"Error in local search: {str(e)}")
            return []
    
    def _calculate_detailed_similarity(self, query_fp, target_fp):
        """Calculate detailed similarity metrics between fingerprints"""
        similarities = {}
        
        try:
            # MFCC similarity
            if 'mfcc' in query_fp and 'mfcc' in target_fp:
                mfcc_sim = 1 - cosine(query_fp['mfcc'], target_fp['mfcc'])
                similarities['mfcc'] = max(0, mfcc_sim)
            
            # Chroma similarity
            if 'chroma' in query_fp and 'chroma' in target_fp:
                chroma_sim = 1 - cosine(query_fp['chroma'], target_fp['chroma'])
                similarities['chroma'] = max(0, chroma_sim)
            
            # Tempo similarity
            query_tempo = query_fp.get('tempo', 120)
            target_tempo = target_fp.get('tempo', 120)
            tempo_diff = abs(query_tempo - target_tempo) / max(query_tempo, target_tempo, 1)
            similarities['tempo'] = max(0, 1 - tempo_diff)
            
            # Energy similarity
            query_energy = query_fp.get('energy', 0)
            target_energy = target_fp.get('energy', 0)
            if query_energy > 0 and target_energy > 0:
                energy_ratio = min(query_energy, target_energy) / max(query_energy, target_energy)
                similarities['energy'] = energy_ratio
            else:
                similarities['energy'] = 0.5
            
            # Key similarity (simple matching)
            query_key = query_fp.get('key', 'Unknown')
            target_key = target_fp.get('key', 'Unknown')
            if query_key != 'Unknown' and target_key != 'Unknown':
                similarities['key'] = 1.0 if query_key == target_key else 0.3
            else:
                similarities['key'] = 0.5
            
            # Overall weighted similarity
            weights = {
                'mfcc': 0.3,
                'chroma': 0.25,
                'tempo': 0.2,
                'energy': 0.15,
                'key': 0.1
            }
            
            weighted_sum = sum(similarities.get(feature, 0) * weight 
                             for feature, weight in weights.items())
            
            similarities['overall'] = weighted_sum
            
        except Exception as e:
            print(f"Error calculating detailed similarity: {str(e)}")
            similarities = {'overall': 0.0}
        
        return similarities
    
    def add_song_to_index(self, song_data):
        """Add a new song to the search index"""
        try:
            # Parse fingerprint
            fingerprint = self._parse_fingerprint(json.loads(song_data['fingerprint_data']))
            
            # Create feature vector
            feature_vector = self.fingerprinter.create_feature_vector(fingerprint)
            
            # Add to indexed songs
            self.indexed_songs.append({
                'id': song_data['id'],
                'file_path': song_data['file_path'],
                'title': song_data['title'],
                'artist': song_data['artist'],
                'album': song_data['album'],
                'tempo': song_data['tempo'],
                'key': song_data['key_signature'],
                'energy': song_data['energy'],
                'fingerprint': fingerprint
            })
            
            # Rebuild index if we have enough songs
            if len(self.indexed_songs) % 100 == 0:  # Rebuild every 100 songs
                songs = self._load_all_songs()
                self._build_faiss_index(songs)
            
        except Exception as e:
            print(f"Error adding song to index: {str(e)}")
    
    def rebuild_index(self):
        """Rebuild the entire search index"""
        try:
            songs = self._load_all_songs()
            self._build_faiss_index(songs)
            print("Search index rebuilt successfully")
        except Exception as e:
            print(f"Error rebuilding index: {str(e)}")
    
    def get_index_stats(self):
        """Get statistics about the search index"""
        return {
            'total_songs': len(self.indexed_songs),
            'feature_dimensions': self.feature_dim,
            'index_type': 'FAISS IndexFlatIP' if self.index else 'None'
        }