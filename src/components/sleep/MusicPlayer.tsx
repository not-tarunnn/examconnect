"use client";

import { useEffect, useState } from 'react';
import { useSpotifyStore } from '@/store/useSpotifyStore';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useSpotify } from '@/hooks/useSpotify';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
  FaSpotify,
  FaTimes
} from 'react-icons/fa';

const MusicPlayer = () => {
  const { collapsed } = useSidebarStore();
  const {
    isConnected,
    playbackState,
    isLoading,
    error,
    play,
    pause,
    next,
    previous,
    setVolume,
    seek,
    setError,
  } = useSpotifyStore();
  
  const { connectToSpotify, disconnect, handleAuthCallback } = useSpotify();
  
  const [volume, setVolumeLocal] = useState(50);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Handle auth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
      handleAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      setError(`Spotify authorization error: ${error}`);
    }
  }, []);

  // Update progress bar
  useEffect(() => {
    if (!isDragging && playbackState) {
      setProgress(playbackState.progress_ms);
    }
  }, [playbackState?.progress_ms, isDragging]);

  // Update volume
  useEffect(() => {
    if (playbackState) {
      setVolumeLocal(playbackState.volume_percent);
    }
  }, [playbackState?.volume_percent]);

  const handlePlayPause = () => {
    if (playbackState?.is_playing) {
      pause();
    } else {
      play();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolumeLocal(newVolume);
    setVolume(newVolume);
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (!isDragging) {
      seek(newProgress);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />;
    if (volume < 50) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  const clearError = () => setError(null);
if (!isConnected) {
  return (
    <div className={`fixed bottom-0 ${collapsed ? 'sm:left-20' : 'sm:left-64'} pl-0 sm:pl-0  right-0 transition-all duration-300`}>
      <div className="m-4">
        <div className="backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between space-x-6 flex-wrap">
            {/* Icon + Text */}
            <div className="flex items-center space-x-4">
              <FaSpotify className="text-green-500 text-3xl" />
              <div>
                <h3 className="text-white text-xl font-semibold">Connect to Spotify</h3>
                <p className="text-white/70 max-w-md">
                  Connect your Spotify account to play relaxing music while you sleep
                </p>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={connectToSpotify}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <FaSpotify />
              <span>{isLoading ? 'Connecting...' : 'Connect to Spotify'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
            <span className="text-red-200 text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-red-200 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Music Player */}
      <div className={`fixed bottom-0 ${collapsed ? 'left-20' : 'left-64'} right-0 transition-all duration-300`}>
        <div className="m-4">
          <div className="backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              {/* Track Info */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {playbackState?.item?.album.images[0] && (
                  <img
                    src={playbackState.item.album.images[0].url}
                    alt={playbackState.item.album.name}
                    className="w-12 h-12 rounded-lg object-cover shadow-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">
                    {playbackState?.item?.name || 'No track playing'}
                  </h4>
                  <p className="text-white/60 text-sm truncate">
                    {playbackState?.item?.artists.map(artist => artist.name).join(', ') || 'No artist'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={previous}
                  className="text-white/70 hover:text-white transition-colors p-2"
                >
                  <FaStepBackward size={16} />
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white p-3 rounded-full transition-all duration-200"
                >
                  {playbackState?.is_playing ? <FaPause size={16} /> : <FaPlay size={16} />}
                </button>
                
                <button
                  onClick={next}
                  className="text-white/70 hover:text-white transition-colors p-2"
                >
                  <FaStepForward size={16} />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-3 ml-6">
                <button className="text-white/70 hover:text-white transition-colors">
                  {getVolumeIcon()}
                </button>
                <div className="w-20 h-1 bg-white/20 rounded-full relative">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${volume}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Disconnect Button */}
              <button
                onClick={disconnect}
                className="text-white/50 hover:text-white/70 transition-colors ml-4 p-2"
                title="Disconnect Spotify"
              >
                <FaTimes />
              </button>
            </div>

            {/* Progress Bar */}
            {playbackState?.item && (
              <div className="mt-4 flex items-center space-x-3">
                <span className="text-white/60 text-xs font-mono">
                  {formatTime(progress)}
                </span>
                <div className="flex-1 h-1 bg-white/20 rounded-full relative">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ 
                      width: `${(progress / (playbackState.item.duration_ms || 1)) * 100}%` 
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={playbackState.item.duration_ms || 100}
                    value={progress}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => {
                      setIsDragging(false);
                      seek(progress);
                    }}
                    onChange={(e) => handleProgressChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-white/60 text-xs font-mono">
                  {formatTime(playbackState.item.duration_ms)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
