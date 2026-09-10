import React, { useState, useMemo, useEffect } from 'react';
import { useBarber } from '../context/BarberContext';
import { ServiceItem, Barber, Appointment } from '../types';
import { getBarberAvailableSlots } from '../utils/scheduleHelper';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';
import { StepServiceSelection } from './Booking/StepServiceSelection';
import { StepBarberSelection } from './Booking/StepBarberSelection';
import { StepDateTimeSelection } from './Booking/StepDateTimeSelection';
import { StepClientDetails } from './Booking/StepClientDetails';
import { StepBookingConfirmation } from './Booking/StepBookingConfirmation';

interface BookingSectionProps {
  preselectedBarberId?: string;
  onBookingSuccess?: (appointment: Appointment) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  preselectedBarberId,
  onBookingSuccess,
  currentStep: propCurrentStep,
  onStepChange
}) => {
  const { config, barbers, services, appointments, addAppointment, clientPhone } = useBarber();

  // Active barbers
  const activeBarbers = useMemo(() => barbers.filter((b) => b.active), [barbers]);

  // Booking Flow Steps: 1: Service, 2: Barber, 3: Date & Time, 4: Client details, 5: Confirmation
  const [internalStep, setInternalStep] = useState<number>(1);
  const currentStep = propCurrentStep !== undefined ? propCurrentStep : internalStep;
  const setCurrentStep = (newStep: number) => {
    if (onStepChange) {
      onStepChange(newStep);
    }
    setInternalStep(newStep);
  };

  // Selected state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(() => services[0] || null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(() => {
    if (preselectedBarberId) {
      const match = barbers.find((b) => b.id === preselectedBarberId || b.name.includes(preselectedBarberId));
      if (match) return match;
    }
    return barbers.find((b) => b.active) || barbers[0] || null;
  });

  // Barber dropdown state for step 2 collapsible menu
  const [isBarberDropdownOpen, setIsBarberDropdownOpen] = useState<boolean>(true);

  // Default to today in YYYY-MM-DD local format
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Client info form
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState(clientPhone || '');
  const [notes, setNotes] = useState('');

  // Confirmed appointment result
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);

  // Service category filter
  const [serviceCategory, setServiceCategory] = useState<string>('todos');

  // Handle preselected barber if passed from stories or team card
  useEffect(() => {
    if (preselectedBarberId) {
      const match = activeBarbers.find((b) => b.id === preselectedBarberId || b.name.includes(preselectedBarberId));
      if (match) {
        setSelectedBarber(match);
      }
    }
  }, [preselectedBarberId, activeBarbers]);

  // Set default service and barber if empty
  useEffect(() => {
    setSelectedService((curr) => curr || (services.length > 0 ? services[0] : null));
  }, [services]);

  useEffect(() => {
    setSelectedBarber((curr) => curr || (activeBarbers.length > 0 ? activeBarbers[0] : null));
  }, [activeBarbers]);

  // Calculate CONDITIONAL SLOTS in real-time
  const slotData = useMemo(() => {
    if (!selectedBarber || !selectedDate) {
      return { isWorkingDay: false, slots: [], reasonMessage: 'Selecciona barbero y fecha' };
    }
    const duration = selectedService ? selectedService.durationMinutes : 45;
    return getBarberAvailableSlots(selectedBarber, selectedDate, appointments, duration);
  }, [selectedBarber, selectedDate, selectedService, appointments]);

  // Filter slots into morning and afternoon
  const morningSlots = useMemo(() => {
    return slotData.slots.filter((s) => {
      const h = parseInt(s.time.split(':')[0], 10);
      return h < 14;
    });
  }, [slotData.slots]);

  const afternoonSlots = useMemo(() => {
    return slotData.slots.filter((s) => {
      const h = parseInt(s.time.split(':')[0], 10);
      return h >= 14;
    });
  }, [slotData.slots]);

  // Generate next 10 days for quick date selector
  const nextDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-ES', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('es-ES', { month: 'short' });

      // Check if current barber works on this day
      const dayOfWeek = d.getDay();
      const isBarberWorking = selectedBarber ? selectedBarber.workDays.includes(dayOfWeek) : true;

      days.push({
        dateStr,
        dayName,
        dayNumber,
        monthName,
        isBarberWorking
      });
    }
    return days;
  }, [selectedBarber]);

  // Handle Booking submission
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTimeSlot) {
      alert('Por favor completa todos los pasos del turno.');
      return;
    }
    if (!clientName.trim() || !phone.trim()) {
      alert('Por favor ingresa tu nombre y número de WhatsApp.');
      return;
    }

    const created = addAppointment({
      clientName: clientName.trim(),
      clientPhone: phone.trim(),
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      date: selectedDate,
      time: selectedTimeSlot,
      durationMinutes: selectedService.durationMinutes,
      totalPrice: selectedService.price,
      notes: notes.trim() || undefined,
      source: 'web'
    });

    setConfirmedApt(created);
    setCurrentStep(5);

    // Launch confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.warn('Confetti unavailable', err);
    }

    if (onBookingSuccess) {
      onBookingSuccess(created);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedTimeSlot(null);
    setConfirmedApt(null);
  };

  return (
    <section id="reservas" className="py-6 sm:py-12 bg-slate-900/50 border-b border-slate-800">
      {/* Hidden Anchors for Menu Navigation */}
      <span id="servicios" className="sr-only">Servicios de Barbería</span>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Agenda en Tiempo Real
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Syne'] tracking-tight">
            Reserva Tu Turno en la Barbería
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-300">
            Sistema inteligente con <strong>renderizado condicional</strong> según el horario específico y disponibilidad de cada barbero.
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="max-w-2xl mx-auto mb-4 sm:mb-8">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs font-semibold">
            {[
              { num: 1, label: 'Servicio' },
              { num: 2, label: 'Barbero' },
              { num: 3, label: 'Fecha/Hora' },
              { num: 4, label: 'Confirmar' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num || currentStep === 5;
              return (
                <div
                  key={step.num}
                  onClick={() => {
                    if (step.num < currentStep && currentStep !== 5) {
                      setCurrentStep(step.num);
                    }
                  }}
                  className={`py-1.5 px-0.5 sm:py-2 sm:px-1 rounded-lg border transition cursor-pointer flex flex-col items-center gap-0.5 sm:gap-1 ${
                    isActive
                      ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                      : isDone
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                      : 'border-slate-800 bg-slate-950 text-slate-500'
                  }`}
                >
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-current">
                    {step.num}
                  </span>
                  <span className="truncate text-[9px] sm:text-xs">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1 - SELECT SERVICE */}
        {currentStep === 1 && (
          <StepServiceSelection
            services={services}
            serviceCategory={serviceCategory}
            setServiceCategory={setServiceCategory}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            currencySymbol={config.currencySymbol}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 2 - SELECT BARBER */}
        {currentStep === 2 && (
          <StepBarberSelection
            activeBarbers={activeBarbers}
            selectedBarber={selectedBarber}
            setSelectedBarber={setSelectedBarber}
            isBarberDropdownOpen={isBarberDropdownOpen}
            setIsBarberDropdownOpen={setIsBarberDropdownOpen}
            onPrev={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {/* STEP 3 - DATE & TIME SLOTS */}
        {currentStep === 3 && (
          <StepDateTimeSelection
            selectedBarber={selectedBarber}
            selectedService={selectedService}
            config={config}
            nextDays={nextDays}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
            slotData={slotData}
            morningSlots={morningSlots}
            afternoonSlots={afternoonSlots}
            getTodayString={getTodayString}
            onPrev={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {/* STEP 4 - CLIENT INFORMATION */}
        {currentStep === 4 && (
          <StepClientDetails
            selectedService={selectedService}
            selectedBarber={selectedBarber}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            config={config}
            clientName={clientName}
            setClientName={setClientName}
            phone={phone}
            setPhone={setPhone}
            notes={notes}
            setNotes={setNotes}
            onPrev={() => setCurrentStep(3)}
            onSubmit={handleConfirmBooking}
          />
        )}

        {/* STEP 5 - SUCCESSFUL CONFIRMATION */}
        {currentStep === 5 && confirmedApt && selectedBarber && selectedService && (
          <StepBookingConfirmation
            confirmedApt={confirmedApt}
            selectedBarber={selectedBarber}
            selectedService={selectedService}
            config={config}
            onReset={handleReset}
          />
        )}
      </div>
    </section>
  );
};
