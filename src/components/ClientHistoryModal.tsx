import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import { Appointment } from '../types';
import { X, Calendar, Clock, User, Phone, CheckCircle2, AlertTriangle, CalendarPlus, Scissors, Search } from 'lucide-react';
import { getGoogleCalendarUrl, downloadCalendarEvent } from '../utils/calendarHelper';

interface ClientHistoryModalProps {
  onClose: () => void;
  onOpenReviewForAppointment?: (apt: Appointment) => void;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  onClose,
  onOpenReviewForAppointment
}) => {
  const { clientPhone, setClientPhone, getClientAppointments, cancelAppointment, barbers, services, config } = useBarber();
  const [searchPhone, setSearchPhone] = useState(clientPhone || '');
  const [searched, setSearched] = useState(Boolean(clientPhone));

  const clientAppointments = searched && searchPhone.trim() ? getClientAppointments(searchPhone) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    setClientPhone(searchPhone.trim());
    setSearched(true);
  };

  const getBarber = (barberId: string) => barbers.find((b) => b.id === barberId);
  const getService = (serviceId: string) => services.find((s) => s.id === serviceId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">Confirmada</span>;
      case 'completada':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">Completada</span>;
      case 'pendiente':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">Pendiente</span>;
      case 'cancelada':
        return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">Cancelada</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white font-['Syne'] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Mis Turnos & Historial
            </h3>
            <p className="text-xs text-slate-400">
              Consulta tus citas agendadas, agrega recordatorios o cancela turnos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone Lookup Form */}
        <form onSubmit={handleSearch} className="my-4 flex gap-2">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="Ingresa tu número de WhatsApp / celular..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" /> Buscar
          </button>
        </form>

        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {!searched ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Ingresa tu número de teléfono para ver los turnos que has reservado.
            </div>
          ) : clientAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-500/50 mx-auto" />
              <p className="text-slate-300 font-semibold">No encontramos citas con este teléfono.</p>
              <p className="text-[11px]">Verifica que hayas escrito los mismos números con los que reservaste.</p>
            </div>
          ) : (
            clientAppointments.map((apt) => {
              const barber = getBarber(apt.barberId);
              const service = getService(apt.serviceId);

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {service?.name || 'Servicio Barbería'}
                        </span>
                        {getStatusBadge(apt.status)}
                      </div>
                      <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                        Barbero: {barber?.name || 'Barbero Oficial'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-white text-sm font-['Syne']">
                        {config.currencySymbol}{apt.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] py-1 border-y border-slate-800/80">
                    <span className="flex items-center gap-1 text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> {apt.date}
                    </span>
                    <span className="flex items-center gap-1 text-slate-200 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {apt.time} hs
                    </span>
                    <span className="text-slate-500">
                      Código: #{apt.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      {barber && service && (
                        <a
                          href={getGoogleCalendarUrl(apt, barber, service, config)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <CalendarPlus className="w-3 h-3 text-amber-400" /> Google Calendar
                        </a>
                      )}

                      {onOpenReviewForAppointment && apt.status !== 'cancelada' && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenReviewForAppointment(apt);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <Scissors className="w-3 h-3" /> Dejar Reseña
                        </button>
                      )}
                    </div>

                    {apt.status === 'confirmada' || apt.status === 'pendiente' ? (
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
                            cancelAppointment(apt.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-[10px] font-semibold underline cursor-pointer"
                      >
                        Cancelar Turno
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
