import { Barber, Appointment } from '../types';

export interface TimeSlot {
  time: string; // "09:00"
  available: boolean;
  reason?: 'ocupado' | 'descanso' | 'fuera_horario' | 'pasado';
}

/**
 * Calculates available time slots for a specific barber on a specific date (YYYY-MM-DD)
 * using conditional logic based on their working days, working hours, break hours,
 * and already scheduled appointments.
 */
export function getBarberAvailableSlots(
  barber: Barber,
  dateString: string, // YYYY-MM-DD
  appointments: Appointment[],
  requestedDurationMinutes: number = 45
): { isWorkingDay: boolean; slots: TimeSlot[]; reasonMessage?: string } {
  if (!barber || !barber.active) {
    return { isWorkingDay: false, slots: [], reasonMessage: 'El barbero seleccionado no se encuentra activo actualmente.' };
  }

  // Parse target date and day of week
  // Ensure date is parsed in local timezone
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 1 is Monday ...

  // 1. Check if barber works on this day
  if (!barber.workDays.includes(dayOfWeek)) {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return {
      isWorkingDay: false,
      slots: [],
      reasonMessage: `${barber.nickname} no atiende los días ${dayNames[dayOfWeek]}. Por favor selecciona otro día.`
    };
  }

  // 2. Parse working hours
  const parseTimeToMinutes = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const formatMinutesToTime = (min: number): string => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const startMin = parseTimeToMinutes(barber.startTime);
  const endMin = parseTimeToMinutes(barber.endTime);
  const breakStartMin = barber.breakStart ? parseTimeToMinutes(barber.breakStart) : null;
  const breakEndMin = barber.breakEnd ? parseTimeToMinutes(barber.breakEnd) : null;

  const slotStep = barber.slotDurationMinutes || 45;

  // Check if today is the target day to filter out past hours
  const now = new Date();
  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month - 1 &&
    now.getDate() === day;
  const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

  // Find existing active appointments for this barber on this date
  const barberAppointments = appointments.filter(
    (apt) => apt.barberId === barber.id && apt.date === dateString && apt.status !== 'cancelada'
  );

  const slots: TimeSlot[] = [];

  for (let m = startMin; m + requestedDurationMinutes <= endMin; m += slotStep) {
    const timeStr = formatMinutesToTime(m);
    const slotEndM = m + requestedDurationMinutes;

    // Check if in the past (if booking for today)
    if (isToday && m <= currentMinutesNow + 15) {
      slots.push({
        time: timeStr,
        available: false,
        reason: 'pasado'
      });
      continue;
    }

    // Check if overlaps with barber's lunch/rest break
    if (breakStartMin !== null && breakEndMin !== null) {
      if (m < breakEndMin && slotEndM > breakStartMin) {
        slots.push({
          time: timeStr,
          available: false,
          reason: 'descanso'
        });
        continue;
      }
    }

    // Check if overlaps with any existing appointment
    const hasConflict = barberAppointments.some((apt) => {
      const aptStart = parseTimeToMinutes(apt.time);
      const aptEnd = aptStart + (apt.durationMinutes || slotStep);
      return m < aptEnd && slotEndM > aptStart;
    });

    if (hasConflict) {
      slots.push({
        time: timeStr,
        available: false,
        reason: 'ocupado'
      });
    } else {
      slots.push({
        time: timeStr,
        available: true
      });
    }
  }

  return {
    isWorkingDay: true,
    slots
  };
}
