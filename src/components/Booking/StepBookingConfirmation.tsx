import React from 'react';
import { Appointment, Barber, ServiceItem, BarberShopConfig } from '../../types';
import { generateWhatsAppBookingUrl } from '../../utils/whatsappHelper';
import { downloadCalendarEvent, getGoogleCalendarUrl } from '../../utils/calendarHelper';
import { CheckCircle2, MessageCircle, CalendarPlus, Download } from 'lucide-react';

interface StepBookingConfirmationProps {
  confirmedApt: Appointment;
  selectedBarber: Barber;
  selectedService: ServiceItem;
  config: BarberShopConfig;
  onReset: () => void;
}

export const StepBookingConfirmation: React.FC<StepBookingConfirmationProps> = ({
  confirmedApt,
  selectedBarber,
  selectedService,
  config,
  onReset
}) => {
  return (
    <div
      id="booking-success-screen"
      className="max-w-2xl mx-auto bg-slate-950 p-6 sm:p-8 rounded-2xl border border-amber-500/40 shadow-2xl text-center"
    >
      <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Syne']">
        ¡Turno Agendado con Éxito!
      </h3>
      <p className="text-xs sm:text-sm text-slate-300 mt-2">
        Tu turno ha sido bloqueado en el horario del barbero en tiempo real.
      </p>

      {/* Receipt details */}
      <div className="my-6 p-4 sm:p-6 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs sm:text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Código de Turno:</span>
          <span className="font-mono font-bold text-amber-400">#{confirmedApt.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Barbero Asignado:</span>
          <span className="font-bold text-white">{selectedBarber.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Servicio Solicitado:</span>
          <span className="font-bold text-white">{selectedService.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Fecha:</span>
          <span className="font-bold text-white">{confirmedApt.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Hora:</span>
          <span className="font-bold text-amber-400 text-base">{confirmedApt.time} hs</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Dirección:</span>
          <span className="font-medium text-slate-300">
            {config.address}, {config.neighborhood}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-800 text-base">
          <span className="font-bold text-slate-200">Importe a Pagar en Local:</span>
          <span className="font-black text-amber-400 font-['Syne']">
            {config.currencySymbol}{confirmedApt.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Primary Action: Send to WhatsApp */}
      <div className="space-y-3">
        <a
          id="whatsapp-confirm-send-btn"
          href={generateWhatsAppBookingUrl(confirmedApt, selectedBarber, selectedService, config)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Enviar Comprobante por WhatsApp al Barbero</span>
        </a>

        {/* Sync Calendar Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href={getGoogleCalendarUrl(confirmedApt, selectedBarber, selectedService, config)}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <CalendarPlus className="w-4 h-4 text-amber-400" />
            <span>Guardar en Google Calendar</span>
          </a>

          <button
            onClick={() => downloadCalendarEvent(confirmedApt, selectedBarber, selectedService, config)}
            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Descargar Recordatorio (.ICS)</span>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-900">
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-amber-400 underline font-medium cursor-pointer"
        >
          Reservar otro turno
        </button>
      </div>
    </div>
  );
};
