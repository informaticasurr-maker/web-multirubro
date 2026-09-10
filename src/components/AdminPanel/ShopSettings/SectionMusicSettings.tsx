import React from 'react';
import { useMusic } from '../../../context/MusicContext';
import { Radio, Play, Pause, Shuffle } from 'lucide-react';

export const SectionMusicSettings: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playRandomTrack,
    selectedGenre,
    setSelectedGenre,
    setIsPlayerOpen
  } = useMusic();

  return (
    <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-amber-500/20 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Música Instrumental y Ambiente para la Ocasión
            </h3>
            <p className="text-xs text-slate-400">
              Selección de mezclas instrumentales (Reggaetón Dembow, Hip-Hop, Latin Chill y Neo-Soul)
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
          {isPlaying ? 'Sonando en Vivo' : 'En Pausa'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
            Pista Actual Seleccionada
          </span>
          <h4 className="text-sm font-extrabold text-white truncate">{currentTrack.title}</h4>
          <p className="text-xs text-slate-400 truncate">
            {currentTrack.artist} • {currentTrack.bpm} BPM
          </p>
          <div className="text-[11px] text-amber-300 font-medium">
            Ocasión: {currentTrack.occasionLabel}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={togglePlayPause}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
            </button>

            <button
              type="button"
              onClick={playRandomTrack}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambiar Aleatorio</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPlayerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              Abrir Radio
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Filtro de Ritmo Rápido
          </span>
          <p className="text-xs text-slate-400">
            Adapta la música de fondo según el tipo de cliente o corte del día:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { id: 'todos', label: 'Mezcla Aleatoria' },
              { id: 'reggaeton', label: 'Reggaetón Dembow' },
              { id: 'hiphop', label: 'Hip-Hop & Trap' },
              { id: 'latin', label: 'Latin Chill & Bossa' },
              { id: 'neosoul', label: 'Neo-Soul & Jazz' }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGenre(g.id as any)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  selectedGenre === g.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
