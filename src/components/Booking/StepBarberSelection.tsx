import React from 'react';
import { Barber } from '../../types';
import { Scissors, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';

interface StepBarberSelectionProps {
  activeBarbers: Barber[];
  selectedBarber: Barber | null;
  setSelectedBarber: (barber: Barber) => void;
  isBarberDropdownOpen: boolean;
  setIsBarberDropdownOpen: (open: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepBarberSelection: React.FC<StepBarberSelectionProps> = ({
  activeBarbers,
  selectedBarber,
  setSelectedBarber,
  isBarberDropdownOpen,
  setIsBarberDropdownOpen,
  onPrev,
  onNext
}) => {
  return (
    <div id="booking-step-2" className="max-w-4xl mx-auto space-y-4">
      {/* Collapsible Dropdown Header Control */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-md transition">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            {selectedBarber ? (
              <img
                src={selectedBarber.avatar}
                alt={selectedBarber.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-400 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Menú Desplegable
                </span>
                {selectedBarber && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">
                    Elegido
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {selectedBarber ? selectedBarber.name : 'Elegir Barbero del Staff'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {selectedBarber
                  ? `${selectedBarber.role} • ⭐ ${selectedBarber.rating}`
                  : 'Desplegar para seleccionar'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="barbers-dropdown-toggle-btn"
            onClick={() => setIsBarberDropdownOpen(!isBarberDropdownOpen)}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer"
          >
            <span className="hidden sm:inline">
              {isBarberDropdownOpen ? 'Plegar Menú' : 'Desplegar Barberos'}
            </span>
            <span className="sm:hidden">
              {isBarberDropdownOpen ? 'Plegar' : 'Desplegar'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isBarberDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Content */}
      {isBarberDropdownOpen && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 animate-fade-in">
          {activeBarbers.map((barber) => {
            const isSelected = selectedBarber?.id === barber.id;
            return (
              <div
                key={barber.id}
                onClick={() => setSelectedBarber(barber)}
                className={`p-2.5 sm:p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="relative mb-2">
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 transition ${
                      isSelected ? 'border-amber-400 scale-105' : 'border-slate-700'
                    }`}
                  />
                  <span className="absolute bottom-0 right-0 bg-slate-950 text-amber-400 px-1 py-0.2 rounded-full text-[9px] sm:text-[10px] font-bold border border-amber-500/40">
                    ⭐ {barber.rating}
                  </span>
                </div>

                <h3 className="font-bold text-xs sm:text-base text-white truncate w-full">
                  {barber.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-amber-400 font-medium truncate w-full">
                  {barber.role}
                </p>

                {/* Barber Specialties */}
                <div className="flex flex-wrap justify-center gap-1 my-2">
                  {barber.specialties.slice(0, 2).map((sp) => (
                    <span
                      key={sp}
                      className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                    >
                      {sp}
                    </span>
                  ))}
                </div>

                {/* Schedule info */}
                <p className="text-[9px] sm:text-[11px] text-slate-400 mb-2 truncate w-full">
                  {barber.startTime} a {barber.endTime} hs
                </p>

                <button
                  type="button"
                  className={`w-full py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950'
                  }`}
                >
                  {isSelected ? 'Elegido ✓' : 'Seleccionar'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 sm:mt-8 flex items-center justify-between gap-2">
        <button
          onClick={onPrev}
          className="px-3 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cambiar Servicio</span>
          <span className="sm:hidden">Atrás</span>
        </button>
        <button
          id="booking-step2-next-btn"
          onClick={onNext}
          disabled={!selectedBarber}
          className="px-5 sm:px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          <span>Continuar: Horarios</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
