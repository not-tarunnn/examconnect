# Spotify Integration Setup Guide

## Overview
The music player component integrates with Spotify Web API and Spotify Web Playback SDK to provide a seamless music streaming experience in the sleep page.

## Prerequisites
1. Spotify Premium account (required for Web Playback SDK)
2. Spotify Developer account

## Setup Steps

### 1. Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Fill in app details:
   - App name: "ExamConnect Sleep Player"
   - App description: "Music player for sleep and relaxation"
   - Website: Your domain
   - Redirect URI: `http://localhost:3000/sleep` (for development)

### 2. Configure Environment Variables
Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/sleep
```

### 3. App Settings in Spotify Dashboard
1. Go to your app settings in Spotify Dashboard
2. Add these Redirect URIs:
   - Development: `http://localhost:3000/sleep`
   - Production: `https://yourdomain.com/sleep`
3. Make sure Web Playback SDK is enabled

### 4. Required Scopes
The app requests these Spotify scopes:
- `streaming` - Control playback in the browser
- `user-read-email` - Read user's email
- `user-read-private` - Read user's subscription details
- `user-read-playback-state` - Read current playback state
- `user-modify-playback-state` - Control playback
- `user-read-currently-playing` - Read currently playing track

## Features

### Music Player Component
- **Glassmorphism Design**: Beautiful blur background with transparency
- **Responsive Layout**: Adapts to sidebar collapse/expand
- **Full Playback Control**: Play, pause, skip, volume, seek
- **Real-time Updates**: Live playback state and progress
- **Error Handling**: User-friendly error messages
- **Connect/Disconnect**: Easy Spotify account management

### Technical Implementation
- **Zustand Store**: State management for Spotify data
- **Web Playback SDK**: Browser-based playback control
- **Web API**: Track information and playback control
- **TypeScript**: Full type safety
- **Responsive**: Works with sidebar collapse state

## Usage

1. Navigate to the Sleep page (`/sleep`)
2. Click "Connect to Spotify" button
3. Authorize the app in Spotify
4. Start playing music from your Spotify account
5. Use the controls to manage playback

## File Structure

```
src/
├── components/
│   └── MusicPlayer.tsx          # Main music player component
├── hooks/
│   └── useSpotify.ts           # Spotify SDK integration hook
├── store/
│   └── useSpotifyStore.ts      # Zustand store for Spotify state
└── app/
    ├── api/spotify/token/
    │   └── route.ts            # Token exchange API endpoint
    └── sleep/
        └── page.tsx            # Sleep page with music player
```

## Troubleshooting

### Common Issues

1. **"Spotify credentials not configured"**
   - Ensure environment variables are set correctly
   - Restart development server after adding variables

2. **"Failed to authenticate"**
   - Check if redirect URI matches exactly in Spotify Dashboard
   - Ensure Spotify app is not in development mode restrictions

3. **"Playback failed"**
   - Spotify Premium subscription required
   - Check if another Spotify session is active
   - Ensure browser supports Web Playback SDK

4. **Player not appearing**
   - Check browser console for JavaScript errors
   - Ensure Spotify Web Playback SDK loaded correctly

### Browser Support
- Chrome (recommended)
- Firefox
- Safari 14+
- Edge

### Notes
- Spotify Premium subscription required for Web Playback SDK
- Only one active Spotify session allowed per account
- Player will transfer control from other devices when activated
