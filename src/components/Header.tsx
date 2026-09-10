import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
  Navigation,
  MessageCircle,
  Radio,
  Building2,
  Instagram,
  Facebook
} from 'lucide-react';
import { generateGeneralWhatsAppUrl } from '../utils/whatsappHelper';
import { useMusic } from '../context/MusicContext';
import { BarberMusicEqualizer } from './BarberMusicEqualizer';
import BarberCreativeMenu from './BarberCreativeMenu';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenClientHistory: () => void;
  onOpenAdmin: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenClientHistory,
  onOpenAdmin,
  onScrollToSection
}) => {
  const { config, isAdmin, appointments } = useBarber();
  const { currentTrack, isPlaying, togglePlayPause, setIsPlayerOpen } = useMusic();
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Haversine formula to compute live distance to the barber shop
  const calculateDistance = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const shopLat = config.coordinates.lat;
        const shopLng = config.coordinates.lng;

        const R = 6371; // Earth radius in km
        const dLat = ((shopLat - userLat) * Math.PI) / 180;
        const dLon = ((shopLng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((shopLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        setDistanceKm(parseFloat(dist.toFixed(1)));
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const pendingCount = appointments.filter((a) => a.status === 'pendiente' || a.status === 'confirmada').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Top micro bar for schedules and live address */}
      <div className="bg-slate-900/80 border-b border-slate-800/60 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {config.openingHoursText}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              {config.address}, {config.neighborhood}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Social & Google Negocios shortcuts */}
            <div className="hidden sm:flex items-center gap-1.5 border-r border-slate-800 pr-3">
              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-md bg-slate-950 hover:bg-pink-500/20 text-slate-400 hover:text-pink-400 border border-slate-800 hover:border-pink-500/40 flex items-center justify-center transition"
                  title="Instagram Oficial"
                >
                  <Instagram className="w-3 h-3" />
                </a>
              )}
              {config.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-md bg-slate-950 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-500/40 flex items-center justify-center transition"
                  title="Facebook Oficial"
                >
                  <Facebook className="w-3 h-3" />
                </a>
              )}
              {config.whatsappNumber && (
                <a
                  href={generateGeneralWhatsAppUrl(config)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-md bg-slate-950 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-center transition"
                  title="WhatsApp Directo"
                >
                  <MessageCircle className="w-3 h-3" />
                </a>
              )}
              {config.googleBusinessUrl && (
                <a
                  href={config.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-md bg-slate-950 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40 flex items-center justify-center transition"
                  title="Google Negocios & Reseñas"
                >
                  <Building2 className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* GPS quick calculation */}
            <button
              id="header-gps-calc-btn"
              onClick={calculateDistance}
              disabled={gpsLoading}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              title="Calcular distancia desde tu ubicación actual"
            >
              <Navigation className={`w-3.5 h-3.5 text-amber-400 ${gpsLoading ? 'animate-spin' : ''}`} />
              {distanceKm !== null ? (
                <span className="text-amber-300 font-semibold">{distanceKm} km de ti</span>
              ) : (
                <span>{gpsLoading ? 'Ubicando...' : '¿A qué distancia estás?'}</span>
              )}
            </button>

            {/* Admin quick toggle badge */}
            <button
              id="header-admin-login-btn"
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition cursor-pointer font-medium ${
                isAdmin
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Admin Activo' : 'Admin'}</span>
              {isAdmin && pendingCount > 0 && (
                <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div
          onClick={() => onScrollToSection('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-amber-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-['Syne']">
                {config.shopName}
              </h1>
              <span className="hidden md:inline-block px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded uppercase tracking-wider">
                Turnos en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-sm">
              {config.slogan}
            </p>
          </div>
        </div>

        {/* Action Buttons & Barber Creative Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Barber Lounge Radio Quick Pill */}
          <button
            id="header-radio-pill-btn"
            onClick={() => setIsPlayerOpen(true)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs transition cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700'
            }`}
            title="Abrir radio de música instrumental de la barbería"
          >
            <div className="w-5 h-5 rounded-md bg-slate-950 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
            </div>
            <div className="hidden md:flex flex-col items-start leading-none text-left min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                Música Barbería
              </span>
              <span className="text-[11px] text-white font-semibold truncate max-w-[100px]">
                {currentTrack.title}
              </span>
            </div>
            <BarberMusicEqualizer isPlaying={isPlaying} barCount={3} heightClass="h-3.5" />
          </button>

          {/* Client History Button */}
          <button
            id="header-client-history-btn"
            onClick={onOpenClientHistory}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all cursor-pointer"
            title="Ver mis citas reservadas"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Mis Turnos</span>
          </button>

          {/* Direct WhatsApp chat */}
          <a
            id="header-whatsapp-btn"
            href={generateGeneralWhatsAppUrl(config)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 sm:p-2 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-lg transition-all"
            title="Escribir por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          {/* Primary Book Now CTA */}
          <button
            id="header-book-cta-btn"
            onClick={onOpenBooking}
            className="hidden md:flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Reservar Cita</span>
          </button>

          {/* Menú Desplegable Creativo Tipo Hoja de Navaja Metálica */}
          <BarberCreativeMenu onNavigate={onScrollToSection} />
        </div>
      </div>
    </header>
  );
};
