import React, { useState, useMemo, useEffect } from 'react';
import { useBarber } from '../context/BarberContext';
import { ServiceItem, Barber, Appointment } from '../types';
import { getBarberAvailableSlots, TimeSlot } from '../utils/scheduleHelper';
import { generateWhatsAppBookingUrl } from '../utils/whatsappHelper';
import { downloadCalendarEvent, getGoogleCalendarUrl } from '../utils/calendarHelper';
import confetti from 'canvas-confetti';
import {
  Scissors,
  User,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Download,
  CalendarPlus,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  DollarSign
} from 'lucide-react';

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
  }, [preselectedBarberId]);

  // Set default service and barber if empty
  useEffect(() => {
    setSelectedService((curr) => curr || (services.length > 0 ? services[0] : null));
  }, [services.length]);

  useEffect(() => {
    setSelectedBarber((curr) => curr || (activeBarbers.length > 0 ? activeBarbers[0] : null));
  }, [activeBarbers.length]);

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
    } catch (e) {
      console.warn('Confetti unavailable', e);
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

        {/* ======================================================== */}
        {/* CONDITIONAL RENDER: STEP 1 - SELECT SERVICE */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div id="booking-step-1" className="max-w-4xl mx-auto">
            {/* Category Filter Tabs */}
            <div id="barba" className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-3 mb-3 sm:mb-6 justify-start sm:justify-center scroll-mt-20">
              {['todos', 'corte', 'barba', 'combo', 'color', 'facial'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setServiceCategory(cat)}
                  className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                    serviceCategory === cat
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {cat === 'todos' ? 'Todos los Servicios' : cat}
                </button>
              ))}
            </div>

            {/* Services Grid: 2 columns on mobile, compact & neat */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {services
                .filter((s) => serviceCategory === 'todos' || s.category === serviceCategory)
                .map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`p-2 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div>
                        {srv.image && (
                          <div className="relative mb-1.5 sm:mb-2">
                            <img
                              src={srv.image}
                              alt={srv.name}
                              className="w-full h-16 sm:h-28 rounded-lg object-cover"
                              loading="lazy"
                            />
                            {srv.popular && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[8px] sm:text-[9px] font-bold rounded shadow-md">
                                Popular
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-bold text-[11px] sm:text-sm text-white line-clamp-1 leading-snug">
                            {srv.name}
                          </h3>
                          {!srv.image && srv.popular && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[8px] sm:text-[9px] font-bold rounded flex-shrink-0">
                              Top
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-xs text-slate-400 line-clamp-1 sm:line-clamp-2 mt-0.5 hidden sm:block">
                          {srv.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 sm:pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-slate-300">
                          <span className="flex items-center gap-1 font-semibold text-amber-400 text-[10px] sm:text-xs">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {srv.durationMinutes}m
                          </span>
                          <span className="text-xs sm:text-lg font-black text-white font-['Syne']">
                            {config.currencySymbol}{srv.price.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-0.5 flex-shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950'
                          }`}
                        >
                          {isSelected ? 'Elegido ✓' : 'Elegir'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Next step button */}
            <div className="mt-6 sm:mt-8 flex justify-end">
              <button
                id="booking-step1-next-btn"
                onClick={() => setCurrentStep(2)}
                disabled={!selectedService}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                <span>Continuar: Elegir Barbero</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONDITIONAL RENDER: STEP 2 - SELECT BARBER (DESPLEGABLE) */}
        {/* ======================================================== */}
        {currentStep === 2 && (
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

            {/* Dropdown Content (Cards in 2 columns on mobile) */}
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
                onClick={() => setCurrentStep(1)}
                className="px-3 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cambiar Servicio</span>
                <span className="sm:hidden">Atrás</span>
              </button>
              <button
                id="booking-step2-next-btn"
                onClick={() => setCurrentStep(3)}
                disabled={!selectedBarber}
                className="px-5 sm:px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                <span>Continuar: Horarios</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONDITIONAL RENDER: STEP 3 - DATE & REAL-TIME SLOTS */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div id="booking-step-3" className="max-w-4xl mx-auto bg-slate-950 p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800">
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
                      <span className="text-[10px] uppercase font-semibold">
                        {d.dayName}
                      </span>
                      <span className="text-lg font-black">{d.dayNumber}</span>
                      <span className="text-[9px] uppercase">{d.monthName}</span>
                      {!d.isBarberWorking && (
                        <span className="text-[8px] text-red-400 font-semibold mt-0.5">
                          Franco
                        </span>
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

              {/* CASE A: Barber does not work on this day */}
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
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cambiar Barbero
              </button>
              <button
                id="booking-step3-next-btn"
                onClick={() => setCurrentStep(4)}
                disabled={!selectedTimeSlot}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                <span>Continuar a Tus Datos ({selectedTimeSlot ? `${selectedTimeSlot} hs` : 'Elige hora'})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONDITIONAL RENDER: STEP 4 - CLIENT INFORMATION */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div id="booking-step-4" className="max-w-xl mx-auto bg-slate-950 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800">
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
            <form onSubmit={handleConfirmBooking} className="space-y-4">
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
                  onClick={() => setCurrentStep(3)}
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
        )}

        {/* ======================================================== */}
        {/* CONDITIONAL RENDER: STEP 5 - SUCCESSFUL CONFIRMATION */}
        {/* ======================================================== */}
        {currentStep === 5 && confirmedApt && selectedBarber && selectedService && (
          <div id="booking-success-screen" className="max-w-2xl mx-auto bg-slate-950 p-6 sm:p-8 rounded-2xl border border-amber-500/40 shadow-2xl text-center">
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
                <span className="font-medium text-slate-300">{config.address}, {config.neighborhood}</span>
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
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-amber-400 underline font-medium cursor-pointer"
              >
                Reservar otro turno
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
