import React from 'react';
import { Barber, ServiceItem, BarberShopConfig } from '../../types';
import { TimeSlot } from '../../utils/scheduleHelper';
import { Clock, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react';

interface DayOption {
  dateStr: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isBarberWorking: boolean;
}

interface StepDateTimeSelectionProps {
  selectedBarber: Barber | null;
  selectedService: ServiceItem | null;
  config: BarberShopConfig;
  nextDays: DayOption[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string | null) => void;
  slotData: { isWorkingDay: boolean; slots: TimeSlot[]; reasonMessage?: string };
  morningSlots: TimeSlot[];
  afternoonSlots: TimeSlot[];
  getTodayString: () => string;
  onPrev: () => void;
  onNext: () => void;
}

export const StepDateTimeSelection: React.FC<StepDateTimeSelectionProps> = ({
  selectedBarber,
  selectedService,
  config,
  nextDays,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  slotData,
  morningSlots,
  afternoonSlots,
  getTodayString,
  onPrev,
  onNext
}) => {
  return (
    <div
      id="booking-step-3"
      className="max-w-4xl mx-auto bg-slate-950 p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800"
    >
      {/* Header summary of selected service & barber */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-4 sm:pb-4 sm:mb-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {selectedBarber && (
            <img
              src={selectedBarber.avatar}
              alt={selectedBarber.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-amber-500"
            />
          )}
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">Atención con:</p>
            <h4 className="text-white font-bold text-xs sm:text-sm">{selectedBarber?.name}</h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] sm:text-xs text-amber-400 font-semibold">{selectedService?.name}</span>
          <p className="text-[10px] sm:text-xs text-slate-400">
            {selectedService?.durationMinutes} min • {config.currencySymbol}{selectedService?.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick 10-Day Date Slider */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 sm:mb-2">
          1. Selecciona el Día
        </label>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {nextDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => {
                  setSelectedDate(d.dateStr);
                  setSelectedTimeSlot(null);
                }}
                className={`flex-shrink-0 flex flex-col items-center py-1.5 px-2.5 sm:py-2.5 sm:px-3.5 rounded-xl border transition cursor-pointer min-w-[56px] sm:min-w-[70px] ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : d.isBarberWorking
                    ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    : 'border-slate-800/40 bg-slate-950/60 text-slate-600 opacity-60'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold">{d.dayName}</span>
                <span className="text-lg font-black">{d.dayNumber}</span>
                <span className="text-[9px] uppercase">{d.monthName}</span>
                {!d.isBarberWorking && (
                  <span className="text-[8px] text-red-400 font-semibold mt-0.5">Franco</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Or manual date selector */}
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span>O elige otra fecha:</span>
          <input
            type="date"
            value={selectedDate}
            min={getTodayString()}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTimeSlot(null);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1 rounded text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* CONDITIONAL RENDERING OF AVAILABLE TIME SLOTS */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          2. Selecciona el Horario Disponible
        </label>

        {!slotData.isWorkingDay ? (
          <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-white font-bold text-sm">Día No Laboral de este Barbero</h4>
            <p className="text-xs text-amber-200/90 mt-1 max-w-md mx-auto">
              {slotData.reasonMessage || `${selectedBarber?.nickname} no atiende en la fecha seleccionada.`}
            </p>
            <p className="text-xs text-slate-400 mt-3">
              💡 Por favor selecciona otro día en el calendario de arriba o cambia de barbero.
            </p>
          </div>
        ) : slotData.slots.length === 0 ? (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">
            <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">No hay turnos disponibles para esta fecha.</p>
            <p className="text-xs text-slate-500 mt-1">Todos los horarios están cubiertos o ya han pasado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Turnos de Mañana (09:00 - 13:30 hs)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {morningSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        title={
                          !slot.available
                            ? slot.reason === 'ocupado'
                              ? 'Horario ya reservado por otro cliente'
                              : slot.reason === 'descanso'
                              ? 'Horario de almuerzo / descanso'
                              : 'Horario pasado'
                            : 'Turno libre'
                        }
                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                            : slot.available
                            ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-500 hover:bg-slate-800'
                            : 'bg-slate-950/60 border-slate-900 text-slate-600 line-through opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <span>{slot.time} hs</span>
                        <span className="text-[9px] font-normal">
                          {slot.available
                            ? 'Disponible'
                            : slot.reason === 'ocupado'
                            ? 'Ocupado'
                            : slot.reason === 'descanso'
                            ? 'Almuerzo'
                            : 'Pasado'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Turnos de Tarde & Noche (14:00 - 21:00 hs)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {afternoonSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        title={
                          !slot.available
                            ? slot.reason === 'ocupado'
                              ? 'Horario ya reservado por otro cliente'
                              : slot.reason === 'descanso'
                              ? 'Horario de almuerzo / descanso'
                              : 'Horario pasado'
                            : 'Turno libre'
                        }
                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                            : slot.available
                            ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-500 hover:bg-slate-800'
                            : 'bg-slate-950/60 border-slate-900 text-slate-600 line-through opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <span>{slot.time} hs</span>
                        <span className="text-[9px] font-normal">
                          {slot.available
                            ? 'Disponible'
                            : slot.reason === 'ocupado'
                            ? 'Ocupado'
                            : slot.reason === 'descanso'
                            ? 'Descanso'
                            : 'Pasado'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onPrev}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Cambiar Barbero
        </button>
        <button
          id="booking-step3-next-btn"
          onClick={onNext}
          disabled={!selectedTimeSlot}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          <span>Continuar a Tus Datos ({selectedTimeSlot ? `${selectedTimeSlot} hs` : 'Elige hora'})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
