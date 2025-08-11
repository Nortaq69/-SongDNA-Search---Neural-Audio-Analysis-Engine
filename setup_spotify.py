#!/usr/bin/env python3
"""
SongDNA Search - Spotify API Setup Helper
This script helps you set up Spotify API credentials.
"""

import os

def setup_spotify_api():
    print("🎵 SongDNA Search - Spotify API Setup")
    print("=" * 50)
    print()
    
    print("To enable Spotify integration, you need API credentials:")
    print("1. Go to https://developer.spotify.com/dashboard/applications")
    print("2. Click 'Create App'")
    print("3. Fill in app details:")
    print("   - App name: SongDNA Search")
    print("   - App description: Audio fingerprinting tool")
    print("   - Website: http://localhost")
    print("   - Redirect URI: http://localhost:8080")
    print("4. Accept terms and create the app")
    print("5. Copy your Client ID and Client Secret")
    print()
    
    # Get user input
    client_id = input("Enter your Spotify Client ID (or press Enter to skip): ").strip()
    
    if not client_id:
        print("⚠️ Skipping Spotify setup. You can set this up later.")
        return
    
    client_secret = input("Enter your Spotify Client Secret: ").strip()
    
    if not client_secret:
        print("❌ Client Secret is required!")
        return
    
    # Create .env file
    env_content = f"""# SongDNA Search - Environment Variables

# Spotify API Configuration
SPOTIFY_CLIENT_ID={client_id}
SPOTIFY_CLIENT_SECRET={client_secret}

# ACRCloud API Configuration (optional)
ACRCLOUD_ACCESS_KEY=your_acrcloud_access_key_here
ACRCLOUD_ACCESS_SECRET=your_acrcloud_access_secret_here

# Database Configuration
DATABASE_URL=sqlite:///songdna.db

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=false
"""
    
    # Write to .env file
    env_path = os.path.join('python', '.env')
    try:
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print(f"✅ Created {env_path}")
        print("🎉 Spotify API setup complete!")
        print()
        print("You can now:")
        print("- Search for similar songs on Spotify")
        print("- Get metadata for matched tracks")
        print("- Open songs directly in Spotify")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        print("You can manually create python/.env with your credentials.")

if __name__ == '__main__':
    setup_spotify_api()

