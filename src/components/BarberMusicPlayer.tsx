import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { GENRE_FILTERS, OCCASIONS_MAP } from '../data/musicTracks';
import { BarberMusicEqualizer } from './BarberMusicEqualizer';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Volume2,
  VolumeX,
  Radio,
  ChevronDown,
  ChevronUp,
  X,
  Flame,
  Sparkles,
  ListMusic,
  Disc,
  Guitar,
  Music,
  Zap,
  Activity
} from 'lucide-react';
import { MusicGenre } from '../types';

interface BarberMusicPlayerProps {
  onPlayerExpand?: () => void;
  onPlayerMinimize?: () => void;
}

export const BarberMusicPlayer: React.FC<BarberMusicPlayerProps> = ({
  onPlayerExpand,
  onPlayerMinimize
}) => {
  const {
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
    setVolume,
    toggleMute,
    setIsShuffle,
    setSelectedGenre,
    setIsPlayerOpen,
    setForceLiveBeats
  } = useMusic();

  const [showTracklist, setShowTracklist] = useState(false);

  const occasionInfo = OCCASIONS_MAP[currentTrack.occasion] || OCCASIONS_MAP.general;

  const handleOpenPlayer = () => {
    setIsPlayerOpen(true);
    if (onPlayerExpand) onPlayerExpand();
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    if (onPlayerMinimize) onPlayerMinimize();
  };

  const getGenreIcon = (genre: MusicGenre) => {
    switch (genre) {
      case 'reggaeton':
        return <Flame className="w-3 h-3 text-amber-400" />;
      case 'hiphop':
        return <Disc className="w-3 h-3 text-cyan-400" />;
      case 'latin':
        return <Guitar className="w-3 h-3 text-emerald-400" />;
      case 'afrobeat':
        return <Zap className="w-3 h-3 text-yellow-400" />;
      case 'neosoul':
        return <Music className="w-3 h-3 text-purple-400" />;
      default:
        return <Shuffle className="w-3 h-3 text-amber-400" />;
    }
  };

  return (
    <div
      id="barber-music-floating-container"
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 transition-all duration-200 select-none pointer-events-auto"
    >
      {/* ======================================================== */}
      {/* 1. ULTRA-COMPACT FLOATING PILL / CAPSULE                 */}
      {/* ======================================================== */}
      {!isPlayerOpen && (
        <div
          onClick={handleOpenPlayer}
          className="group cursor-pointer bg-slate-900/95 hover:bg-slate-900 backdrop-blur-xl border border-amber-500/35 hover:border-amber-400/70 rounded-full py-1.5 px-2.5 sm:px-3 shadow-xl shadow-black/80 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 max-w-[280px] sm:max-w-xs"
        >
          {/* Mini Spinning Vinyl Avatar */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-950 border border-amber-400/60 flex-shrink-0 flex items-center justify-center shadow-inner">
            {currentTrack.coverImage ? (
              <img
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_9s_linear_infinite]' : ''}`}
              />
            ) : (
              <Radio className="w-3.5 h-3.5 text-amber-400" />
            )}
            {/* Vinyl Center Hole */}
            <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-slate-950 border border-amber-400/70" />
            {/* Equalizer glow when playing */}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                <BarberMusicEqualizer isPlaying={true} barCount={3} heightClass="h-2.5" />
              </div>
            )}
          </div>

          {/* Compact Track Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-0.5 truncate">
                {getGenreIcon(currentTrack.genre)}
                {currentTrack.genreLabel.split(' ')[0]}
              </span>
              <span className="text-[8px] text-slate-500 font-mono">
                {currentTrack.bpm}BPM
              </span>
            </div>
            <h4 className="text-[11px] font-bold text-white truncate max-w-[110px] sm:max-w-[130px] leading-tight">
              {currentTrack.title}
            </h4>
          </div>

          {/* Compact Quick Actions */}
          <div
            className="flex items-center gap-1 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="music-mini-play-btn"
              onClick={togglePlayPause}
              className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 active:scale-90 transition cursor-pointer"
              title={isPlaying ? 'Pausar música' : 'Reproducir música'}
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
            </button>

            <button
              id="music-mini-next-btn"
              onClick={playNext}
              className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer active:scale-90"
              title="Siguiente canción"
            >
              <SkipForward className="w-3 h-3" />
            </button>

            <button
              onClick={handleOpenPlayer}
              className="w-6 h-6 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Expandir reproductor"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. COMPACT EXPANDED LOUNGE PLAYER CARD                   */}
      {/* ======================================================== */}
      {isPlayerOpen && (
        <div className="w-[calc(100vw-1.5rem)] sm:w-80 max-w-[310px] bg-slate-900/95 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-3 sm:p-3.5 shadow-2xl shadow-black/90 space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-150">
          {/* Header & Controls */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Radio className="w-3 h-3 animate-pulse" />
              </div>
              <div className="truncate">
                <h3 className="text-[11px] font-extrabold text-white uppercase tracking-wider font-['Syne'] flex items-center gap-1 truncate">
                  <span>Radio Barbería</span>
                  <span className="text-[8px] px-1 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-sans font-bold">
                    Lounge
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setShowTracklist((prev) => !prev)}
                className={`p-1 rounded-md text-xs transition cursor-pointer ${
                  showTracklist
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Ver lista de canciones"
              >
                <ListMusic className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClosePlayer}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Minimizar reproductor (o presiona Atrás)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Compact Vinyl & Track Info */}
          <div className="flex items-center gap-2.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
            {/* Mini Vinyl */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-500/50 flex-shrink-0 shadow-md shadow-black/60">
              {currentTrack.coverImage ? (
                <img
                  src={currentTrack.coverImage}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-amber-400">
                  <Disc className="w-5 h-5" />
                </div>
              )}
              {/* Vinyl center pin */}
              <div className="absolute inset-0 m-auto w-3 h-3 bg-slate-950 rounded-full border border-amber-400/80" />
            </div>

            {/* Title & Artist */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold rounded-full truncate">
                  {getGenreIcon(currentTrack.genre)}
                  {currentTrack.genreLabel.split(' ')[0]}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {currentTrack.bpm} BPM
                </span>
              </div>

              <h4 className="text-xs font-bold text-white truncate leading-snug">
                {currentTrack.title}
              </h4>

              <p className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Mini Waveform / Equalizer */}
          <div className="px-2.5 py-1 bg-slate-950/60 rounded-lg border border-slate-800/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <BarberMusicEqualizer isPlaying={isPlaying} barCount={6} heightClass="h-3" />
              <span className="text-[9px] text-slate-400 font-medium">
                {isPlaying ? 'Sonando en vivo' : 'En pausa'}
              </span>
            </div>

            <span className="text-[9px] text-amber-400/90 font-medium truncate max-w-[120px] text-right">
              {occasionInfo.label}
            </span>
          </div>

          {/* Compact Primary Controls */}
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-center gap-2.5">
              {/* Shuffle toggle */}
              <button
                id="music-shuffle-btn"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isShuffle
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title={isShuffle ? 'Modo aleatorio activado' : 'Activar modo aleatorio'}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              {/* Previous */}
              <button
                id="music-prev-btn"
                onClick={playPrevious}
                className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition active:scale-95 cursor-pointer"
                title="Anterior"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Main Play/Pause */}
              <button
                id="music-main-play-btn"
                onClick={togglePlayPause}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30 active:scale-95 transition transform cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                id="music-next-btn"
                onClick={playNext}
                className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition active:scale-95 cursor-pointer"
                title="Siguiente"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Random Surprise Me Button */}
              <button
                id="music-random-pick-btn"
                onClick={playRandomTrack}
                className="px-2 py-1.5 rounded-lg bg-slate-800/90 hover:bg-amber-500/20 text-amber-400 border border-slate-700 hover:border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                title="Canción al azar"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Azar</span>
              </button>
            </div>

            {/* Slim Volume Slider */}
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition cursor-pointer"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[9px] text-slate-400 font-mono w-7 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Compact Genre Tags */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              <span>Ritmos:</span>
              <span className="text-amber-400 font-normal">
                {selectedGenre === 'todos' ? 'Todos' : currentTrack.genreLabel.split(' ')[0]}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {GENRE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setSelectedGenre(f.key);
                    if (f.key !== 'todos') {
                      const match = filteredTracks.find((t) => t.genre === f.key);
                      if (match && currentTrack.genre !== f.key) {
                        playTrack(match);
                      }
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                    selectedGenre === f.key
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {getGenreIcon(f.key as MusicGenre)}
                  <span>{f.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drawer: Full Tracklist (Compact) */}
          {showTracklist && (
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1 max-h-36 overflow-y-auto">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pb-0.5 border-b border-slate-800">
                <span>CANCIÓN ({filteredTracks.length})</span>
                <span>GÉNERO</span>
              </div>
              {filteredTracks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => playTrack(t)}
                  className={`p-1.5 rounded-lg flex items-center justify-between gap-1.5 cursor-pointer transition text-left ${
                    currentTrack.id === t.id
                      ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center flex-shrink-0 text-amber-400">
                      {currentTrack.id === t.id && isPlaying ? (
                        <BarberMusicEqualizer isPlaying={true} barCount={3} heightClass="h-2.5" />
                      ) : (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-bold truncate leading-tight">{t.title}</p>
                      <p className="text-[9px] text-slate-500 truncate">{t.artist}</p>
                    </div>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-medium flex-shrink-0">
                    {t.genreLabel.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
