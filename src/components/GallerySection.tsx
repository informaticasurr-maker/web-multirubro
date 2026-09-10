import React, { useState, useRef } from 'react';
import { useBarber } from '../context/BarberContext';
import { Heart, Scissors, Play, Sparkles, Filter, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  onSelectCutForBooking?: (barberId?: string) => void;
  onOpenAdminGallery?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  onSelectCutForBooking,
  onOpenAdminGallery
}) => {
  const { gallery, barbers, likeGalleryItem, isAdmin } = useBarber();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<GalleryItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = ['todos', ...Array.from(new Set(gallery.map((g) => g.category)))];

  const filteredItems = gallery.filter((item) => {
    if (selectedCategory === 'todos') return true;
    return item.category === selectedCategory;
  });

  const getBarberName = (barberId: string) => {
    const b = barbers.find((barber) => barber.id === barberId);
    return b ? b.name : 'Barbero Oficial';
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
    <section id="cortes" className="py-6 sm:py-10 bg-slate-950 border-b border-slate-900 scroll-mt-14">
      {/* Anchor alias for backwards compatibility */}
      <span id="galeria" className="sr-only">Galería de Cortes y Estilos</span>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 sm:mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Galería de Estilos & Cortes
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white font-['Syne'] tracking-tight">
              Cortes & Estilos de la Barbería
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Tira horizontal compacta: deslizá hacia los lados para explorar todos los estilos.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Menú Desplegable de Estilos */}
            <div className="relative">
              <button
                type="button"
                id="gallery-category-dropdown-btn"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                <span className="capitalize">
                  {selectedCategory === 'todos' ? 'Todos los Estilos' : selectedCategory}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú desplegable flotante */}
              {isCategoryDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-30 animate-fade-in backdrop-blur-md">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Filtrar por estilo:
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-semibold capitalize flex items-center justify-between hover:bg-slate-800 transition cursor-pointer ${
                        selectedCategory === cat ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>{cat === 'todos' ? 'Todos los Estilos' : cat}</span>
                      {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Carrusel Controles Izquierda / Derecha */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={scrollLeft}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Desplazar a la izquierda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Desplazar a la derecha"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {isAdmin && onOpenAdminGallery && (
              <button
                id="admin-open-gallery-mgr-btn"
                onClick={onOpenAdminGallery}
                className="px-2.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer whitespace-nowrap"
              >
                + Gestionar
              </button>
            )}
          </div>
        </div>

        {/* TIRA EN UNA SOLA FILA / COLUMNA HORIZONTAL COMPACTA */}
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap overflow-x-auto gap-2.5 sm:gap-4 pb-3 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-900"
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="w-[170px] sm:w-[210px] md:w-[230px] flex-shrink-0 snap-start group relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col hover:border-amber-500/50 transition-all duration-300 shadow-md"
            >
              {/* Media Preview: altura compacta para no saturar la pantalla */}
              <div className="relative h-28 sm:h-36 w-full bg-black overflow-hidden flex-shrink-0">
                {item.mediaType === 'video' ? (
                  <div
                    onClick={() => setActiveVideoModal(item)}
                    className="w-full h-full relative cursor-pointer group/video"
                  >
                    <video
                      src={item.mediaUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/video:bg-black/20 transition">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg transform group-hover/video:scale-110 transition">
                        <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}

                {/* Category badge */}
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-[8px] sm:text-[9px] font-bold text-amber-400">
                  {item.category}
                </span>

                {/* Like button */}
                <button
                  onClick={() => likeGalleryItem(item.id)}
                  className="absolute top-1.5 right-1.5 p-1 sm:p-1.5 rounded-full bg-slate-950/85 backdrop-blur-sm text-slate-300 hover:text-red-400 border border-slate-800 transition cursor-pointer flex items-center gap-0.5 text-[9px]"
                  title="Me gusta este corte"
                >
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-red-500/20 text-red-500" />
                  <span className="font-bold">{item.likes}</span>
                </button>
              </div>

              {/* Card Footer info: diseño ultra compacto y legible */}
              <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[11px] sm:text-xs text-white group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  <span className="text-[9px] text-slate-400 truncate max-w-[95px] sm:max-w-[120px]">
                    <strong className="text-slate-200">{getBarberName(item.barberId)}</strong>
                  </span>

                  <button
                    onClick={() => {
                      if (onSelectCutForBooking) {
                        onSelectCutForBooking(item.barberId);
                      }
                    }}
                    className="text-[9px] sm:text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
                  >
                    <Scissors className="w-2.5 h-2.5" /> Pedir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicador de scroll táctil para móviles */}
        <div className="flex sm:hidden items-center justify-center gap-1 mt-1 text-[10px] text-slate-500">
          <span>👈 Deslizá horizontalmente para más cortes 👉</span>
        </div>

        {/* Video Pop-up Modal if playing short video */}
        {activeVideoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveVideoModal(null)}
          >
            <div
              className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={activeVideoModal.mediaUrl}
                controls
                autoPlay
                className="w-full max-h-[70vh] object-cover"
              />
              <div className="p-4">
                <h4 className="font-bold text-white text-base">{activeVideoModal.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{activeVideoModal.description}</p>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
                >
                  Cerrar Video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
