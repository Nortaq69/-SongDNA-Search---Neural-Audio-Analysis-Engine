import requests
import os
import base64
import hashlib
import time
from typing import List, Dict
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json

class ExternalAPIManager:
    """Manager for external music APIs (Spotify, ACRCloud, etc.)"""
    
    def __init__(self):
        self.spotify = None
        self.acrcloud_config = None
        self.setup_apis()
    
    def setup_apis(self):
        """Setup external API clients"""
        try:
            # Setup Spotify API
            client_id = os.getenv('SPOTIFY_CLIENT_ID')
            client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
            
            if client_id and client_secret:
                client_credentials_manager = SpotifyClientCredentials(
                    client_id=client_id,
                    client_secret=client_secret
                )
                self.spotify = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
                print("Spotify API initialized")
            else:
                print("Spotify API credentials not found")
            
            # Setup ACRCloud API
            access_key = os.getenv('ACRCLOUD_ACCESS_KEY')
            access_secret = os.getenv('ACRCLOUD_ACCESS_SECRET')
            
            if access_key and access_secret:
                self.acrcloud_config = {
                    'host': 'identify-us-west-2.acrcloud.com',
                    'access_key': access_key,
                    'access_secret': access_secret,
                    'timeout': 10
                }
                print("ACRCloud API initialized")
            else:
                print("ACRCloud API credentials not found")
                
        except Exception as e:
            print(f"Error setting up APIs: {str(e)}")
    
    def search_external(self, fingerprint_data, max_results=10):
        """Search external APIs for similar songs"""
        results = []
        
        # Search Spotify
        spotify_results = self.search_spotify_by_features(fingerprint_data, max_results)
        results.extend(spotify_results)
        
        # Add other API searches here
        # acrcloud_results = self.search_acrcloud(fingerprint_data)
        # results.extend(acrcloud_results)
        
        return results[:max_results]
    
    def search_spotify_by_features(self, fingerprint_data, max_results=10):
        """Search Spotify using audio features"""
        if not self.spotify:
            return []
        
        try:
            # Convert our fingerprint to Spotify-compatible features
            spotify_features = self._convert_to_spotify_features(fingerprint_data)
            
            # Search for tracks with similar features
            results = self.spotify.recommendations(
                limit=max_results,
                target_acousticness=spotify_features.get('acousticness', 0.5),
                target_danceability=spotify_features.get('danceability', 0.5),
                target_energy=spotify_features.get('energy', 0.5),
                target_instrumentalness=spotify_features.get('instrumentalness', 0.5),
                target_liveness=spotify_features.get('liveness', 0.5),
                target_loudness=spotify_features.get('loudness', -10),
                target_speechiness=spotify_features.get('speechiness', 0.1),
                target_tempo=spotify_features.get('tempo', 120),
                target_valence=spotify_features.get('valence', 0.5)
            )
            
            formatted_results = []
            for track in results['tracks']:
                # Get audio features for similarity calculation
                audio_features = self.spotify.audio_features(track['id'])[0]
                
                if audio_features:
                    similarity = self._calculate_spotify_similarity(spotify_features, audio_features)
                    
                    result = {
                        'title': track['name'],
                        'artist': ', '.join([artist['name'] for artist in track['artists']]),
                        'album': track['album']['name'],
                        'similarity': similarity,
                        'spotify_id': track['id'],
                        'spotify_url': track['external_urls']['spotify'],
                        'preview_url': track['preview_url'],
                        'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                        'audio_features': audio_features,
                        'source': 'spotify'
                    }
                    formatted_results.append(result)
            
            # Sort by similarity
            formatted_results.sort(key=lambda x: x['similarity'], reverse=True)
            return formatted_results
            
        except Exception as e:
            print(f"Error searching Spotify: {str(e)}")
            return []
    
    def _convert_to_spotify_features(self, fingerprint_data):
        """Convert our fingerprint to Spotify-compatible features"""
        try:
            # Extract relevant features from our fingerprint
            tempo = fingerprint_data.get('tempo', 120)
            energy = fingerprint_data.get('energy', 0.5)
            
            # Map our features to Spotify's scale
            spotify_features = {
                'tempo': max(60, min(200, tempo)),  # Clamp tempo
                'energy': max(0, min(1, energy)),   # Energy 0-1
                'acousticness': 0.5,  # Default values for features we don't directly extract
                'danceability': max(0, min(1, energy * 0.8)),  # Approximate from energy
                'instrumentalness': 0.7,  # Assume mostly instrumental for similarity
                'liveness': 0.1,
                'loudness': -10,  # Average loudness
                'speechiness': 0.1,  # Low speechiness for music
                'valence': 0.5  # Neutral valence
            }
            
            # Adjust based on key and other features if available
            if 'key' in fingerprint_data:
                key_str = fingerprint_data['key']
                if 'minor' in key_str.lower():
                    spotify_features['valence'] = 0.3  # Minor keys tend to be sadder
                elif 'major' in key_str.lower():
                    spotify_features['valence'] = 0.7  # Major keys tend to be happier
            
            return spotify_features
            
        except Exception as e:
            print(f"Error converting to Spotify features: {str(e)}")
            return {
                'tempo': 120,
                'energy': 0.5,
                'acousticness': 0.5,
                'danceability': 0.5,
                'instrumentalness': 0.7,
                'liveness': 0.1,
                'loudness': -10,
                'speechiness': 0.1,
                'valence': 0.5
            }
    
    def _calculate_spotify_similarity(self, query_features, track_features):
        """Calculate similarity between query and Spotify track features"""
        try:
            # Features to compare
            feature_names = ['acousticness', 'danceability', 'energy', 'instrumentalness', 
                           'liveness', 'speechiness', 'valence']
            
            total_similarity = 0
            valid_features = 0
            
            for feature in feature_names:
                if feature in query_features and feature in track_features:
                    query_val = query_features[feature]
                    track_val = track_features[feature]
                    
                    # Calculate normalized difference (0 = identical, 1 = maximum difference)
                    diff = abs(query_val - track_val)
                    similarity = 1 - diff  # Convert to similarity (1 = identical, 0 = maximum difference)
                    
                    total_similarity += similarity
                    valid_features += 1
            
            # Tempo similarity (special handling due to different scale)
            if 'tempo' in query_features and 'tempo' in track_features:
                query_tempo = query_features['tempo']
                track_tempo = track_features['tempo']
                
                tempo_diff = abs(query_tempo - track_tempo) / max(query_tempo, track_tempo, 1)
                tempo_similarity = max(0, 1 - tempo_diff)
                
                total_similarity += tempo_similarity
                valid_features += 1
            
            # Average similarity
            if valid_features > 0:
                return total_similarity / valid_features
            else:
                return 0.0
                
        except Exception as e:
            print(f"Error calculating Spotify similarity: {str(e)}")
            return 0.0
    
    def search_acrcloud(self, audio_file_path):
        """Search ACRCloud for audio identification"""
        if not self.acrcloud_config:
            return []
        
        try:
            # Read audio file
            with open(audio_file_path, 'rb') as f:
                audio_data = f.read()
            
            # Prepare ACRCloud request
            timestamp = str(int(time.time()))
            string_to_sign = f"POST\n/v1/identify\n{self.acrcloud_config['access_key']}\naudio\n1\n{timestamp}"
            signature = base64.b64encode(
                hashlib.hmac.new(
                    self.acrcloud_config['access_secret'].encode(),
                    string_to_sign.encode(),
                    hashlib.sha1
                ).digest()
            ).decode()
            
            # Request data
            files = {'sample': audio_data}
            data = {
                'access_key': self.acrcloud_config['access_key'],
                'sample_bytes': len(audio_data),
                'timestamp': timestamp,
                'signature': signature,
                'data_type': 'audio',
                'signature_version': '1'
            }
            
            # Make request
            response = requests.post(
                f"http://{self.acrcloud_config['host']}/v1/identify",
                files=files,
                data=data,
                timeout=self.acrcloud_config['timeout']
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_acrcloud_results(result)
            else:
                print(f"ACRCloud API error: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error searching ACRCloud: {str(e)}")
            return []
    
    def _parse_acrcloud_results(self, acrcloud_result):
        """Parse ACRCloud API results"""
        try:
            if acrcloud_result.get('status', {}).get('code') == 0:
                results = []
                
                music_data = acrcloud_result.get('metadata', {}).get('music', [])
                for track in music_data:
                    result = {
                        'title': track.get('title', 'Unknown'),
                        'artist': ', '.join([artist.get('name', 'Unknown') for artist in track.get('artists', [])]),
                        'album': track.get('album', {}).get('name', 'Unknown'),
                        'similarity': track.get('score', 0) / 100.0,  # Convert to 0-1 scale
                        'duration': track.get('duration_ms', 0) / 1000.0,
                        'release_date': track.get('release_date', 'Unknown'),
                        'source': 'acrcloud'
                    }
                    results.append(result)
                
                return results
            else:
                print(f"ACRCloud identification failed: {acrcloud_result.get('status', {}).get('msg', 'Unknown error')}")
                return []
                
        except Exception as e:
            print(f"Error parsing ACRCloud results: {str(e)}")
            return []
    
    def get_spotify_track_info(self, track_id):
        """Get detailed Spotify track information"""
        if not self.spotify:
            return None
        
        try:
            track = self.spotify.track(track_id)
            audio_features = self.spotify.audio_features(track_id)[0]
            
            return {
                'track': track,
                'audio_features': audio_features
            }
            
        except Exception as e:
            print(f"Error getting Spotify track info: {str(e)}")
            return None