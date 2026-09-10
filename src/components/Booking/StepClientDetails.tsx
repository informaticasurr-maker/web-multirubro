import React from 'react';
import { Barber, ServiceItem, BarberShopConfig } from '../../types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface StepClientDetailsProps {
  selectedService: ServiceItem | null;
  selectedBarber: Barber | null;
  selectedDate: string;
  selectedTimeSlot: string | null;
  config: BarberShopConfig;
  clientName: string;
  setClientName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const StepClientDetails: React.FC<StepClientDetailsProps> = ({
  selectedService,
  selectedBarber,
  selectedDate,
  selectedTimeSlot,
  config,
  clientName,
  setClientName,
  phone,
  setPhone,
  notes,
  setNotes,
  onPrev,
  onSubmit
}) => {
  return (
    <div
      id="booking-step-4"
      className="max-w-xl mx-auto bg-slate-950 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800"
    >
      <h3 className="text-base sm:text-xl font-bold text-white font-['Syne'] mb-1 sm:mb-2">
        Tus Datos para la Confirmación
      </h3>
      <p className="text-[10px] sm:text-xs text-slate-400 mb-3 sm:mb-6">
        Garantizamos tu turno de forma inmediata enviando el comprobante directamente a tu WhatsApp.
      </p>

      {/* Summary card */}
      <div className="p-3 sm:p-4 bg-slate-900 rounded-xl border border-slate-800 mb-4 sm:mb-6 text-[10px] sm:text-xs text-slate-300 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-400">Servicio:</span>
          <span className="font-bold text-white">{selectedService?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Barbero:</span>
          <span className="font-bold text-amber-400">{selectedBarber?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Fecha & Hora:</span>
          <span className="font-bold text-white">
            {selectedDate} a las {selectedTimeSlot} hs
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
          <span className="font-bold text-slate-200">Total a Pagar en Local:</span>
          <span className="font-black text-amber-400 font-['Syne']">
            {config.currencySymbol}{selectedService?.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Lucas Benítez"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Número de Celular / WhatsApp *
          </label>
          <input
            type="tel"
            required
            placeholder="Ej: +54 9 11 1234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition"
          />
          <span className="text-[11px] text-slate-500 block mt-1">
            Te enviaremos los recordatorios de turno a este número.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Notas adicionales para el corte (Opcional)
          </label>
          <textarea
            rows={2}
            placeholder="Ej: Degradado bajo en V, arreglo de bigote fino..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </button>
          <button
            id="booking-submit-final-btn"
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Reserva</span>
          </button>
        </div>
      </form>
    </div>
  );
};
