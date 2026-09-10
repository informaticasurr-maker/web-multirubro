import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import { Appointment, AppointmentStatus } from '../../types';
import { Calendar, Clock, Phone, User, Check, X, CheckCircle2, MessageCircle, Filter, Search } from 'lucide-react';

export const TabAppointments: React.FC = () => {
  const { appointments, updateAppointmentStatus, barbers, services, config } = useBarber();
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterBarber, setFilterBarber] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus !== 'todos' && apt.status !== filterStatus) return false;
    if (filterBarber !== 'todos' && apt.barberId !== filterBarber) return false;
    if (searchTerm.trim()) {
      const matchClient = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone = apt.clientPhone.includes(searchTerm);
      if (!matchClient && !matchPhone) return false;
    }
    return true;
  });

  const getBarberName = (id: string) => barbers.find((b) => b.id === id)?.name || 'Barbero';
  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name || 'Servicio';

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por cliente o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <select
            value={filterBarber}
            onChange={(e) => setFilterBarber(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos los Barberos</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nickname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Table / Cards */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
            No se encontraron citas con los filtros seleccionados.
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const cleanPhone = apt.clientPhone.replace(/[^0-9]/g, '');
            const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hola ${apt.clientName}, te escribimos de ${config.shopName} respecto a tu turno del ${apt.date} a las ${apt.time} hs.`
            )}`;

            return (
              <div
                key={apt.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{apt.clientName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        apt.status === 'confirmada'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : apt.status === 'completada'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : apt.status === 'pendiente'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> {apt.date}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {apt.time} hs
                    </span>
                    <span>
                      Barbero: <strong className="text-slate-300">{getBarberName(apt.barberId)}</strong>
                    </span>
                    <span>
                      Servicio: <strong className="text-slate-300">{getServiceName(apt.serviceId)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" /> {apt.clientPhone}
                    </span>
                    {apt.notes && (
                      <span className="italic text-slate-500 truncate max-w-xs">
                        Nota: "{apt.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Status change actions & Contact */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800 rounded-lg transition"
                    title="Escribir por WhatsApp al cliente"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {apt.status !== 'completada' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'completada')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="Marcar como atendido y sumar a ingresos de caja"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cobrado & Completado
                    </button>
                  )}

                  {apt.status === 'pendiente' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'confirmada')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirmar
                    </button>
                  )}

                  {apt.status !== 'cancelada' && (
                    <button
                      onClick={() => {
                        if (confirm('¿Cancelar este turno y liberar el horario?')) {
                          updateAppointmentStatus(apt.id, 'cancelada');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 rounded-lg transition cursor-pointer"
                      title="Cancelar cita"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
