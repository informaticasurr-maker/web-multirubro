import React, { useState, useEffect, useRef } from 'react';
import { StoryItem } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Eye,
  Calendar,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Pause,
  Play,
  MessageCircle
} from 'lucide-react';

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
  onSelectStoryForBooking?: (story: StoryItem) => void;
  onViewStory?: (storyId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  onClose,
  onSelectStoryForBooking,
  onViewStory
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStory = stories[currentIndex];
  const storyDurationMs = currentStory?.mediaType === 'video' ? 12000 : 5500;

  // Track view when story opens or changes
  useEffect(() => {
    if (currentStory && onViewStory) {
      onViewStory(currentStory.id);
    }
  }, [currentIndex, currentStory?.id, onViewStory]);

  // Handle auto-advance progress timer
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // update progress every 50ms
    const step = (interval / storyDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, storyDurationMs]);

  // Handle keyboard arrow navigation & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  if (!currentStory) return null;

  const storyScope = currentStory.scope || 'dia';

  const scopeBadgeConfig = {
    dia: {
      label: 'Historia del Día',
      icon: <Flame className="w-3 h-3 text-amber-400" />,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      ctaText: `Quiero este corte con ${currentStory.barberName}`,
      ctaIcon: <Scissors className="w-4 h-4" />
    },
    semana: {
      label: 'Noticia de la Semana',
      icon: <Calendar className="w-3 h-3 text-sky-400" />,
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      ctaText: 'Aprovechar Promo / Agendar Turno',
      ctaIcon: <Calendar className="w-4 h-4" />
    },
    mes: {
      label: 'Anuncio del Mes',
      icon: <Sparkles className="w-3 h-3 text-purple-400" />,
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      ctaText: 'Participar / Reservar Turno',
      ctaIcon: <Sparkles className="w-4 h-4" />
    }
  }[storyScope];

  return (
    <div
      id="story-viewer-backdrop"
      className="fixed inset-0 z-50 bg-black/95 sm:backdrop-blur-md flex items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Container simulating Facebook full-screen immersive story format */}
      <div
        id="story-card-container"
        className="relative w-full h-full sm:h-[92vh] sm:max-h-[850px] sm:max-w-md md:max-w-lg bg-slate-950 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:border sm:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Bars */}
        <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-4 right-2.5 sm:right-4 z-30 flex gap-1 sm:gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 sm:h-1.5 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header info (Facebook-style with profile avatar & scope tag) */}
        <div className="absolute top-5 sm:top-7 left-2.5 sm:left-4 right-2.5 sm:right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5 bg-black/50 sm:bg-black/40 backdrop-blur-md px-2 sm:px-3 py-1.5 rounded-full border border-white/10">
            <img
              src={currentStory.barberAvatar}
              alt={currentStory.barberName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-amber-400"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-white font-bold text-xs sm:text-sm tracking-tight drop-shadow-md">
                  {currentStory.barberName}
                </p>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${scopeBadgeConfig.badgeClass}`}>
                  {scopeBadgeConfig.icon}
                  <span>{scopeBadgeConfig.label}</span>
                </span>
              </div>
              <p className="text-amber-300 text-[10px] sm:text-xs flex items-center gap-1 font-medium drop-shadow">
                <Scissors className="w-2.5 h-2.5 text-amber-400" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentStory.title}</span>
              </p>
            </div>
          </div>

          {/* Controls: Pause, Mute, Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1.5 sm:p-2 text-white/90 hover:text-white bg-black/50 rounded-full backdrop-blur-sm transition cursor-pointer"
              title={isPaused ? 'Reanudar' : 'Pausar'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {currentStory.mediaType === 'video' && (
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="p-1.5 sm:p-2 text-white/90 hover:text-white bg-black/50 rounded-full backdrop-blur-sm transition cursor-pointer"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            <button
              id="story-close-btn"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-white/90 hover:text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Main Media Display (Fill space immersive Facebook format) */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {currentStory.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              loop
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* Navigation touch zones: Tap left for previous, Tap right for next */}
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
            onClick={handlePrev}
            title="Anterior"
          />
          <div
            className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
            onClick={handleNext}
            title="Siguiente"
          />

          {/* Overlay gradient at bottom for legibility */}
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Bottom Caption & Booking CTA */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-5 z-30 flex flex-col gap-2.5 sm:gap-3 bg-slate-950/80 backdrop-blur-sm sm:backdrop-blur-none border-t border-white/5 sm:border-none">
          <div className="text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-amber-300 font-['Syne'] line-clamp-1">
                {currentStory.title}
              </h3>
              {currentStory.tag && (
                <span className="text-[9px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full font-medium">
                  {currentStory.tag}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 line-clamp-2 mt-1 drop-shadow leading-relaxed">
              {currentStory.caption}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] sm:text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-400" />
                {currentStory.viewsCount} visualizaciones
              </span>
              <span>• Publicado recientemente</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="story-book-look-btn"
              onClick={() => {
                if (onSelectStoryForBooking) onSelectStoryForBooking(currentStory);
                onClose();
              }}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              {scopeBadgeConfig.ctaIcon}
              <span className="truncate">{scopeBadgeConfig.ctaText}</span>
            </button>
          </div>
        </div>

        {/* Side navigation arrows for desktop */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
            aria-label="Historia anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
            aria-label="Siguiente historia"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
