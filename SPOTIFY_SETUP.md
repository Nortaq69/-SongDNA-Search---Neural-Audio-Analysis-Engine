# 🎵 Spotify API Setup Guide

## Quick Setup

### 1. Get Spotify API Credentials

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard/applications
   - Sign in with your Spotify account

2. **Create a New App**
   - Click "Create App"
   - Fill in the details:
     - **App name**: `SongDNA Search`
     - **App description**: `Audio fingerprinting and similarity search tool`
     - **Website**: `http://localhost`
     - **Redirect URI**: `http://localhost:8080`
   - Accept terms and create

3. **Copy Your Credentials**
   - Click on your new app
   - Copy the **Client ID** and **Client Secret**

### 2. Configure SongDNA Search

#### Option A: Use the Setup Script
```bash
python setup_spotify.py
```

#### Option B: Manual Setup
1. Create file: `python/.env`
2. Add your credentials:
```bash
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### 3. Restart the Application

After adding credentials, restart the app:
```bash
npm start
```

## Features Enabled

With Spotify API configured, you can:
- ✅ Search for similar songs on Spotify
- ✅ Get track metadata (title, artist, album)
- ✅ Open songs directly in Spotify
- ✅ Preview 30-second audio clips
- ✅ Get audio features for better matching

## Troubleshooting

### "Spotify API credentials not found"
- Check that `python/.env` file exists
- Verify Client ID and Secret are correct
- Restart the application

### "Rate limit exceeded"
- Spotify has API rate limits
- Wait a few minutes and try again
- Consider upgrading to Spotify Premium for higher limits

### "Authentication failed"
- Check your internet connection
- Verify credentials are copied correctly
- Make sure the app is registered properly

## Advanced Configuration

### Custom Redirect URI
If you need a different redirect URI:
1. Go to your Spotify app settings
2. Add the new URI to "Redirect URIs"
3. Update the setup script if needed

### Multiple Users
For production use:
- Create separate apps for different users
- Use environment variables for deployment
- Consider OAuth flow for user-specific access

## API Limits

- **Free tier**: 25 requests per second
- **Premium**: Higher limits available
- **Quota**: 10,000 requests per day (free)

## Support

If you need help:
- Check the [Spotify API documentation](https://developer.spotify.com/documentation/web-api/)
- Review the [SongDNA Search documentation](README.md)
- Open an issue on GitHub

