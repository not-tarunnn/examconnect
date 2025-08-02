import { create } from 'zustand';

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  uri: string;
}

export interface PlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: Track | null;
  shuffle_state: boolean;
  repeat_state: 'off' | 'context' | 'track';
  volume_percent: number;
}

interface SpotifyStore {
  // Auth state
  isConnected: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  
  // Player state
  player: any;
  deviceId: string | null;
  playbackState: PlaybackState | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTokens: (access: string, refresh: string, expiresIn: number) => void;
  setPlayer: (player: any) => void;
  setDeviceId: (id: string) => void;
  setPlaybackState: (state: PlaybackState | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTokens: () => void;
  
  // Spotify actions
  play: (uri?: string) => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  seek: (position: number) => Promise<void>;
}

export const useSpotifyStore = create<SpotifyStore>((set, get) => ({
  // Initial state
  isConnected: false,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  player: null,
  deviceId: null,
  playbackState: null,
  isLoading: false,
  error: null,
  
  // Actions
  setTokens: (access, refresh, expiresIn) => {
    const expiry = Date.now() + (expiresIn * 1000);
    localStorage.setItem('spotify_access_token', access);
    localStorage.setItem('spotify_refresh_token', refresh);
    localStorage.setItem('spotify_token_expiry', expiry.toString());
    set({
      accessToken: access,
      refreshToken: refresh,
      tokenExpiry: expiry,
      isConnected: true,
    });
  },
  
  setPlayer: (player) => set({ player }),
  setDeviceId: (id) => set({ deviceId: id }),
  setPlaybackState: (state) => set({ playbackState: state }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  clearTokens: () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    set({
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      isConnected: false,
      player: null,
      deviceId: null,
      playbackState: null,
    });
  },
  
  // Spotify Web API calls
  play: async (uri) => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) return;
    
    try {
      const body = uri ? { uris: [uri] } : {};
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Error playing track:', error);
      set({ error: 'Failed to play track' });
    }
  },
  
  pause: async () => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) return;
    
    try {
      await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error pausing track:', error);
      set({ error: 'Failed to pause track' });
    }
  },
  
  next: async () => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) return;
    
    try {
      await fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error skipping to next track:', error);
      set({ error: 'Failed to skip track' });
    }
  },
  
  previous: async () => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) return;
    
    try {
      await fetch(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error going to previous track:', error);
      set({ error: 'Failed to go to previous track' });
    }
  },
  
  setVolume: async (volume) => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) return;
    
    try {
      await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}&device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error setting volume:', error);
      set({ error: 'Failed to set volume' });
    }
  },
  
  seek: async (position) => {
    const { accessToken, deviceId } = get();
    if (!accessToken || !deviceId) return;
    
    try {
      await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${position}&device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error seeking:', error);
      set({ error: 'Failed to seek' });
    }
  },
}));
