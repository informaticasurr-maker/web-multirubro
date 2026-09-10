import { Appointment, Barber, ServiceItem, BarberShopConfig } from '../types';

export function downloadCalendarEvent(
  appointment: Appointment,
  barber: Barber,
  service: ServiceItem,
  config: BarberShopConfig
) {
  const [year, month, day] = appointment.date.split('-');
  const [hours, minutes] = appointment.time.split(':');

  const startDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );

  const durationMs = (service.durationMinutes || 45) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Barberia Elite Turnos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:apt-${appointment.id}@barberia.local`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:Turno en ${config.shopName} - ${service.name}`,
    `DESCRIPTION:Cita con ${barber.name} para ${service.name}. Total: ${config.currencySymbol}${appointment.totalPrice}. Tel: ${config.adminPhone}`,
    `LOCATION:${config.address}, ${config.neighborhood}, ${config.city}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio: Turno en 1 hora en ${config.shopName}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `turno-${config.shopName.replace(/\s+/g, '_')}-${appointment.date}.ics`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(
  appointment: Appointment,
  barber: Barber,
  service: ServiceItem,
  config: BarberShopConfig
): string {
  const [year, month, day] = appointment.date.split('-');
  const [hours, minutes] = appointment.time.split(':');

  const startDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes)
  );
  const durationMs = (service.durationMinutes || 45) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const datesParam = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
  const title = encodeURIComponent(`Turno con ${barber.nickname} - ${service.name} en ${config.shopName}`);
  const details = encodeURIComponent(`Turno reservado en ${config.shopName}. Barbero: ${barber.name}. Teléfono barbería: ${config.adminPhone}`);
  const location = encodeURIComponent(`${config.address}, ${config.city}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}
