"use client";

import { useEffect, useCallback } from 'react';
import { useSpotifyStore } from '@/store/useSpotifyStore';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/sleep';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
].join(' ');

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export const useSpotify = () => {
  const {
    isConnected,
    accessToken,
    tokenExpiry,
    player,
    setTokens,
    setPlayer,
    setDeviceId,
    setPlaybackState,
    setIsConnected,
    setIsLoading,
    setError,
    clearTokens,
  } = useSpotifyStore();

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiry) return true;
    return Date.now() >= tokenExpiry;
  }, [tokenExpiry]);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('spotify_access_token');
    const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
    const storedExpiry = localStorage.getItem('spotify_token_expiry');

    if (storedAccessToken && storedRefreshToken && storedExpiry) {
      const expiry = parseInt(storedExpiry);
      if (Date.now() < expiry) {
        setTokens(storedAccessToken, storedRefreshToken, (expiry - Date.now()) / 1000);
      } else {
        clearTokens();
      }
    }
  }, []);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken || isTokenExpired()) return;

    // Load Spotify Web Playback SDK
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'ExamConnect Sleep Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken || "");
        },
        volume: 0.5,
      });

      setPlayer(spotifyPlayer);

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
        console.error('Failed to initialize:', message);
        setError('Failed to initialize Spotify player');
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
        console.error('Failed to authenticate:', message);
        setError('Spotify authentication failed');
        clearTokens();
      });

      spotifyPlayer.addListener('account_error', ({ message }: any) => {
        console.error('Failed to validate Spotify account:', message);
        setError('Spotify account validation failed');
      });

      spotifyPlayer.addListener('playback_error', ({ message }: any) => {
        console.error('Failed to perform playback:', message);
        setError('Playback error occurred');
      });

      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) return;

        setPlaybackState({
          is_playing: !state.paused,
          progress_ms: state.position,
          item: state.track_window.current_track,
          shuffle_state: state.shuffle,
          repeat_state: state.repeat_mode === 0 ? 'off' : state.repeat_mode === 1 ? 'context' : 'track',
          volume_percent: state.volume * 100,
        });
      });

      // Ready
      spotifyPlayer.addListener('ready', ({ device_id }: any) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setIsConnected(true);
        setError(null);
      });

      // Not Ready
      spotifyPlayer.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id);
        setIsConnected(false);
      });

      // Connect to the player
      spotifyPlayer.connect();
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken, isTokenExpired]);

  const connectToSpotify = () => {
    if (!CLIENT_ID) {
      setError('Spotify Client ID not configured');
      return;
    }

    const state = Math.random().toString(36).substring(7);
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('scope', SCOPES);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('show_dialog', 'true');

    window.location.href = authUrl.toString();
  };

  const handleAuthCallback = async (code: string) => {
    if (!CLIENT_ID) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      setTokens(data.access_token, data.refresh_token, data.expires_in);
    } catch (error) {
      console.error('Error handling auth callback:', error);
      setError('Failed to authenticate with Spotify');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    if (player) {
      player.disconnect();
    }
    clearTokens();
  };

  return {
    isConnected,
    connectToSpotify,
    handleAuthCallback,
    disconnect,
    isTokenExpired,
  };
};
