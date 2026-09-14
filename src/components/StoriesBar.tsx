import React, { useState, useRef } from 'react';
import { useBarber } from '../context/BarberContext';
import { StoryItem, StoryScope } from '../types';
import { StoryViewerModal } from './StoryViewerModal';
import { Plus, Flame, Sparkles, Calendar, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface StoriesBarProps {
  onOpenAdminStories?: () => void;
  onSelectStoryForBooking?: (story: StoryItem) => void;
  activeStoryIndex?: number | null;
  onOpenStory?: (index: number) => void;
  onCloseStory?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  onOpenAdminStories,
  onSelectStoryForBooking,
  activeStoryIndex,
  onOpenStory,
  onCloseStory
}) => {
  const { stories, isAdmin, incrementStoryViews } = useBarber();
  const [internalStoryIndex, setInternalStoryIndex] = useState<number | null>(null);
  const [activeScopeFilter, setActiveScopeFilter] = useState<'all' | StoryScope>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedIndex = activeStoryIndex !== undefined ? activeStoryIndex : internalStoryIndex;

  // Filter stories based on selected scope tab
  const displayedStories = stories.filter((story) => {
    if (activeScopeFilter === 'all') return true;
    return (story.scope || 'dia') === activeScopeFilter;
  });

  const handleSelectStory = (storyId: string) => {
    // Find original index in full stories array for modal continuity
    const originalIndex = stories.findIndex((s) => s.id === storyId);
    if (originalIndex !== -1) {
      if (onOpenStory) {
        onOpenStory(originalIndex);
      }
      setInternalStoryIndex(originalIndex);
    }
  };

  const handleClose = () => {
    if (onCloseStory) {
      onCloseStory();
    }
    setInternalStoryIndex(null);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <section id="historias" className="bg-slate-950/95 border-b border-slate-900 py-2 sm:py-3 relative select-none">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Header bar with tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5 font-['Syne']">
                <span>Historias & Noticias</span>
                <span className="text-[9px] sm:text-[10px] font-normal normal-case text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                  Formato Facebook
                </span>
              </h2>
            </div>

            {/* Desktop scroll buttons */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Ver historias anteriores"
                className="w-6 h-6 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Ver más historias"
                className="w-6 h-6 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scope Filters: Todas, Día, Semana, Mes */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <button
              type="button"
              onClick={() => setActiveScopeFilter('all')}
              className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                activeScopeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              Todas ({stories.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveScopeFilter('dia')}
              className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                activeScopeFilter === 'dia'
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800/80'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Del Día ({stories.filter((s) => (s.scope || 'dia') === 'dia').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScopeFilter('semana')}
              className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                activeScopeFilter === 'semana'
                  ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-sky-400 border border-slate-800/80'
              }`}
            >
              <Calendar className="w-3 h-3 text-sky-400" />
              <span>Semana ({stories.filter((s) => s.scope === 'semana').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScopeFilter('mes')}
              className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                activeScopeFilter === 'mes'
                  ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-purple-400 border border-slate-800/80'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Mes ({stories.filter((s) => s.scope === 'mes').length})</span>
            </button>
          </div>
        </div>

        {/* Facebook-style Stories Carousel:
            Responsive card widths: w-[105px] sm:w-[125px] md:w-[140px] aspect-[9/14]
            Guarantees at least 3 cards visible simultaneously on standard phones (360px+)
            Finger swipeable with smooth snap scroll */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory scroll-smooth touch-pan-x overscroll-x-contain"
          >
            {/* Facebook-style First Card: "Crear Historia / Subir Estado" (Only for Admin) */}
            {isAdmin && onOpenAdminStories && (
              <button
                id="stories-facebook-create-card"
                onClick={onOpenAdminStories}
                className="w-[105px] sm:w-[125px] md:w-[140px] aspect-[9/14] flex-shrink-0 snap-start rounded-2xl overflow-hidden relative group cursor-pointer border border-dashed border-amber-500/50 hover:border-amber-400 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between p-2.5"
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Publicar
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>

                <div className="flex flex-col items-center justify-center my-auto">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-white mt-2 group-hover:text-amber-400 transition-colors text-center leading-tight">
                    Crear Estado
                  </span>
                </div>

                <p className="text-[8px] sm:text-[9px] text-slate-400 text-center truncate">
                  Día • Semana • Mes
                </p>
              </button>
            )}

            {/* Stories Cards List */}
            {displayedStories.map((story) => {
              const scopeType = story.scope || 'dia';

              const ringBorderColor =
                scopeType === 'semana'
                  ? 'border-sky-400 ring-sky-400/30'
                  : scopeType === 'mes'
                  ? 'border-purple-400 ring-purple-400/30'
                  : 'border-amber-400 ring-amber-400/30';

              const badgeColor =
                scopeType === 'semana'
                  ? 'bg-sky-500/90 text-slate-950'
                  : scopeType === 'mes'
                  ? 'bg-purple-600/95 text-white'
                  : 'bg-amber-500/90 text-slate-950';

              const badgeLabel =
                scopeType === 'semana' ? 'Semana' : scopeType === 'mes' ? 'Mes' : 'Hoy';

              return (
                <button
                  key={story.id}
                  onClick={() => handleSelectStory(story.id)}
                  className="w-[105px] sm:w-[125px] md:w-[140px] aspect-[9/14] flex-shrink-0 snap-start rounded-2xl overflow-hidden relative group cursor-pointer border border-slate-800/80 hover:border-amber-500/60 transition-all hover:scale-[1.02] shadow-xl text-left bg-slate-900"
                >
                  {/* Media background preview */}
                  <img
                    src={story.thumbnailUrl || story.mediaUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/40 pointer-events-none" />

                  {/* Top Bar inside card: Avatar and Scope Tag */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="relative">
                      <img
                        src={story.barberAvatar}
                        alt={story.barberName}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 ${ringBorderColor} shadow-md`}
                      />
                      {story.mediaType === 'video' && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
                          <Play className="w-2 h-2 fill-amber-400" />
                        </span>
                      )}
                    </div>

                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Bottom Text inside card */}
                  <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                    <p className="text-[10px] sm:text-[11px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                      {story.title}
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-amber-400/90 font-medium truncate mt-0.5">
                      {story.barberName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Touch swipe indicator fade on right side */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-slate-950 to-transparent sm:hidden opacity-90" />
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={selectedIndex}
          onClose={handleClose}
          onSelectStoryForBooking={onSelectStoryForBooking}
          onViewStory={incrementStoryViews}
        />
      )}
    </section>
  );
};
