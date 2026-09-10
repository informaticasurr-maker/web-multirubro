import React from 'react';
import { useBarber } from '../../context/BarberContext';
import { DollarSign, TrendingUp, Calendar, CheckCircle2, User, Scissors, PieChart } from 'lucide-react';

export const TabFinancials: React.FC = () => {
  const { appointments, barbers, services, config } = useBarber();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.slice(0, 7); // YYYY-MM

  // Completed or confirmed appointments
  const paidAppointments = appointments.filter((a) => a.status === 'completada' || a.status === 'confirmada');
  const completedOnly = appointments.filter((a) => a.status === 'completada');

  const totalCollected = completedOnly.reduce((acc, a) => acc + a.totalPrice, 0);
  const potentialTotal = paidAppointments.reduce((acc, a) => acc + a.totalPrice, 0);

  const todayIncome = appointments
    .filter((a) => a.date === todayStr && (a.status === 'completada' || a.status === 'confirmada'))
    .reduce((acc, a) => acc + a.totalPrice, 0);

  const monthIncome = appointments
    .filter((a) => a.date.startsWith(currentMonthPrefix) && (a.status === 'completada' || a.status === 'confirmada'))
    .reduce((acc, a) => acc + a.totalPrice, 0);

  const averageTicket = paidAppointments.length > 0 ? Math.round(potentialTotal / paidAppointments.length) : 0;

  // Breakdown by barber
  const barberStats = barbers.map((barber) => {
    const bAppointments = paidAppointments.filter((a) => a.barberId === barber.id);
    const revenue = bAppointments.reduce((acc, a) => acc + a.totalPrice, 0);
    return {
      barber,
      count: bAppointments.length,
      revenue
    };
  });

  // Breakdown by service
  const serviceStats = services.map((srv) => {
    const sAppointments = paidAppointments.filter((a) => a.serviceId === srv.id);
    const revenue = sAppointments.reduce((acc, a) => acc + a.totalPrice, 0);
    return {
      service: srv,
      count: sAppointments.length,
      revenue
    };
  }).filter((s) => s.count > 0);

  return (
    <div className="space-y-6 text-xs">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span>Ingresos Hoy</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Syne']">
            {config.currencySymbol}{todayIncome.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">Caja en curso del día</span>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span>Ingresos del Mes</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-['Syne']">
            {config.currencySymbol}{monthIncome.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Total recaudado y agendado</span>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span>Cortes Completados</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Syne']">
            {completedOnly.length}
          </p>
          <span className="text-[10px] text-slate-400">Clientes atendidos en caja</span>
        </div>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span>Ticket Promedio</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Syne']">
            {config.currencySymbol}{averageTicket.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Valor medio por servicio</span>
        </div>
      </div>

      {/* Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance by Barber */}
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <User className="w-4 h-4 text-amber-400" />
            <span>Recaudación por Barbero</span>
          </div>

          <div className="space-y-3">
            {barberStats.map(({ barber, count, revenue }) => {
              const percent = potentialTotal > 0 ? Math.round((revenue / potentialTotal) * 100) : 0;
              return (
                <div key={barber.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={barber.avatar} alt={barber.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold text-slate-200">{barber.name}</span>
                      <span className="text-slate-500">({count} turnos)</span>
                    </div>
                    <span className="font-black text-amber-400 font-['Syne']">
                      {config.currencySymbol}{revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Servicios Más Rentables</span>
          </div>

          <div className="space-y-3">
            {serviceStats.map(({ service, count, revenue }) => (
              <div key={service.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">{service.name}</h4>
                  <span className="text-[11px] text-slate-400">{count} servicios solicitados</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-400 text-sm font-['Syne']">
                    {config.currencySymbol}{revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
