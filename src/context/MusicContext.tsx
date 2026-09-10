import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { InstrumentalTrack, MusicGenre } from '../types';
import { INSTRUMENTAL_TRACKS } from '../data/musicTracks';
import { globalBarberAudioEngine } from '../utils/barberAudioEngine';

interface MusicContextType {
  tracks: InstrumentalTrack[];
  currentTrack: InstrumentalTrack;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isShuffle: boolean;
  selectedGenre: MusicGenre;
  isPlayerOpen: boolean;
  forceLiveBeats: boolean;
  filteredTracks: InstrumentalTrack[];

  // Actions
  playTrack: (track: InstrumentalTrack) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playRandomTrack: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  setIsShuffle: (val: boolean) => void;
  setSelectedGenre: (genre: MusicGenre) => void;
  setIsPlayerOpen: (open: boolean) => void;
  togglePlayerOpen: () => void;
  setForceLiveBeats: (val: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks] = useState<InstrumentalTrack[]>(INSTRUMENTAL_TRACKS);
  // Pick random first track on initial mount
  const [currentTrack, setCurrentTrack] = useState<InstrumentalTrack>(() => {
    const randomIndex = Math.floor(Math.random() * INSTRUMENTAL_TRACKS.length);
    return INSTRUMENTAL_TRACKS[randomIndex] || INSTRUMENTAL_TRACKS[0];
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isShuffle, setIsShuffle] = useState(true); // Active shuffle by default
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>('todos');
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [forceLiveBeats, setForceLiveBeats] = useState(false);

  // Track whether the user has explicitly paused the player
  const hasManuallyPausedRef = React.useRef<boolean>(false);

  // Filtered tracks based on selected genre
  const filteredTracks = useMemo(() => {
    if (selectedGenre === 'todos') {
      return tracks;
    }
    return tracks.filter((t) => t.genre === selectedGenre);
  }, [tracks, selectedGenre]);

  // Sync state with audio engine
  useEffect(() => {
    const unsubState = globalBarberAudioEngine.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    const unsubTrackEnded = globalBarberAudioEngine.onTrackEnded(() => {
      // Auto-advance: if shuffle, pick random next track
      playNext();
    });

    return () => {
      unsubState();
      unsubTrackEnded();
    };
  }, [isShuffle, filteredTracks, currentTrack]);

  // Auto-play on entry: Start playing music when the user enters the page,
  // with fallback to first user interaction if blocked by browser policy
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user explicitly paused in this session
    const wasSessionPaused = sessionStorage.getItem('barber_music_manually_paused') === 'true';
    if (wasSessionPaused) {
      hasManuallyPausedRef.current = true;
      return;
    }

    let started = false;

    const startPlayback = () => {
      if (hasManuallyPausedRef.current || started) return;
      started = true;
      playTrack(currentTrack);
    };

    // 1. Attempt immediate autoplay
    try {
      startPlayback();
    } catch {
      // Ignored if browser requires user gesture
    }

    // 2. Add one-time user interaction listeners to fulfill browser autoplay policy
    const handleFirstUserGesture = () => {
      if (!hasManuallyPausedRef.current && !globalBarberAudioEngine.getIsPlaying()) {
        startPlayback();
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
      window.removeEventListener('click', handleFirstUserGesture);
      window.removeEventListener('keydown', handleFirstUserGesture);
    };

    window.addEventListener('pointerdown', handleFirstUserGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstUserGesture, { once: true, passive: true });
    window.addEventListener('click', handleFirstUserGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstUserGesture, { once: true, passive: true });

    return () => {
      cleanupListeners();
    };
  }, [currentTrack]);

  const playTrack = useCallback(
    (track: InstrumentalTrack) => {
      hasManuallyPausedRef.current = false;
      try {
        sessionStorage.removeItem('barber_music_manually_paused');
      } catch {
        // Safe fallback
      }
      setCurrentTrack(track);
      globalBarberAudioEngine.playTrack(track, forceLiveBeats);
    },
    [forceLiveBeats]
  );

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      // User requested pause
      hasManuallyPausedRef.current = true;
      try {
        sessionStorage.setItem('barber_music_manually_paused', 'true');
      } catch {
        // Safe fallback
      }
      globalBarberAudioEngine.pause();
    } else {
      // User requested resume/play
      hasManuallyPausedRef.current = false;
      try {
        sessionStorage.removeItem('barber_music_manually_paused');
      } catch {
        // Safe fallback
      }
      if (!globalBarberAudioEngine.getCurrentTrack()) {
        playTrack(currentTrack);
      } else {
        globalBarberAudioEngine.resume();
      }
    }
  }, [isPlaying, currentTrack, playTrack]);

  const playRandomTrack = useCallback(() => {
    const pool = filteredTracks.length > 0 ? filteredTracks : tracks;
    const available = pool.filter((t) => t.id !== currentTrack.id);
    const chosen =
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : pool[0];

    playTrack(chosen);
  }, [filteredTracks, tracks, currentTrack, playTrack]);

  const playNext = useCallback(() => {
    const pool = filteredTracks.length > 0 ? filteredTracks : tracks;
    if (isShuffle) {
      playRandomTrack();
      return;
    }

    const currentIndex = pool.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % pool.length;
    playTrack(pool[nextIndex]);
  }, [isShuffle, filteredTracks, tracks, currentTrack, playRandomTrack, playTrack]);

  const playPrevious = useCallback(() => {
    const pool = filteredTracks.length > 0 ? filteredTracks : tracks;
    const currentIndex = pool.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + pool.length) % pool.length;
    playTrack(pool[prevIndex]);
  }, [filteredTracks, tracks, currentTrack, playTrack]);

  const handleSetVolume = useCallback((val: number) => {
    setVolumeState(val);
    globalBarberAudioEngine.setVolume(val);
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = globalBarberAudioEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  const togglePlayerOpen = useCallback(() => {
    setIsPlayerOpen((prev) => !prev);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        isMuted,
        volume,
        isShuffle,
        selectedGenre,
        isPlayerOpen,
        forceLiveBeats,
        filteredTracks,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        playRandomTrack,
        setVolume: handleSetVolume,
        toggleMute: handleToggleMute,
        setIsShuffle,
        setSelectedGenre,
        setIsPlayerOpen,
        togglePlayerOpen,
        setForceLiveBeats
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
