import React from 'react';
import { ServiceItem } from '../../types';
import { Clock, ChevronRight } from 'lucide-react';

interface StepServiceSelectionProps {
  services: ServiceItem[];
  serviceCategory: string;
  setServiceCategory: (category: string) => void;
  selectedService: ServiceItem | null;
  setSelectedService: (service: ServiceItem) => void;
  currencySymbol: string;
  onNext: () => void;
}

export const StepServiceSelection: React.FC<StepServiceSelectionProps> = ({
  services,
  serviceCategory,
  setServiceCategory,
  selectedService,
  setSelectedService,
  currencySymbol,
  onNext
}) => {
  return (
    <div id="booking-step-1" className="max-w-4xl mx-auto">
      {/* Category Filter Tabs */}
      <div
        id="barba"
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 mb-3 sm:mb-6 justify-start sm:justify-center scroll-mt-20"
      >
        {['todos', 'corte', 'barba', 'combo', 'color', 'facial'].map((cat) => (
          <button
            key={cat}
            onClick={() => setServiceCategory(cat)}
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
              serviceCategory === cat
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {cat === 'todos' ? 'Todos los Servicios' : cat}
          </button>
        ))}
      </div>

      {/* Services Grid: 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {services
          .filter((s) => serviceCategory === 'todos' || s.category === serviceCategory)
          .map((srv) => {
            const isSelected = selectedService?.id === srv.id;
            return (
              <div
                key={srv.id}
                onClick={() => setSelectedService(srv)}
                className={`p-2 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  {srv.image && (
                    <div className="relative mb-1.5 sm:mb-2">
                      <img
                        src={srv.image}
                        alt={srv.name}
                        className="w-full h-16 sm:h-28 rounded-lg object-cover"
                        loading="lazy"
                      />
                      {srv.popular && (
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[8px] sm:text-[9px] font-bold rounded shadow-md">
                          Popular
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-[11px] sm:text-sm text-white line-clamp-1 leading-snug">
                      {srv.name}
                    </h3>
                    {!srv.image && srv.popular && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[8px] sm:text-[9px] font-bold rounded flex-shrink-0">
                        Top
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] sm:text-xs text-slate-400 line-clamp-1 sm:line-clamp-2 mt-0.5 hidden sm:block">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-slate-300">
                    <span className="flex items-center gap-1 font-semibold text-amber-400 text-[10px] sm:text-xs">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {srv.durationMinutes}m
                    </span>
                    <span className="text-xs sm:text-lg font-black text-white font-['Syne']">
                      {currencySymbol}{srv.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-0.5 flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950'
                    }`}
                  >
                    {isSelected ? 'Elegido ✓' : 'Elegir'}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Next step button */}
      <div className="mt-6 sm:mt-8 flex justify-end">
        <button
          id="booking-step1-next-btn"
          onClick={onNext}
          disabled={!selectedService}
          className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          <span>Continuar: Elegir Barbero</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
