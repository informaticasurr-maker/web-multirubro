import React from 'react';
import { useBarber } from '../context/BarberContext';
import {
  Calendar,
  MessageCircle,
  Scissors,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Radio,
  Instagram,
  Facebook,
  Building2
} from 'lucide-react';
import { generateGeneralWhatsAppUrl } from '../utils/whatsappHelper';
import { useMusic } from '../context/MusicContext';
import { BarberMusicEqualizer } from './BarberMusicEqualizer';

interface HeroSectionProps {
  onOpenBooking: (barberId?: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onScrollToSection
}) => {
  const { config, barbers, reviews } = useBarber();
  const { currentTrack, isPlaying, togglePlayPause, setIsPlayerOpen } = useMusic();

  const activeBarbers = barbers.filter((b) => b.active);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '4.9';

  // Headline sizing helper (responsive and compact on mobile)
  const getHeadlineSizeClass = (size?: string) => {
    switch (size) {
      case 'compacto':
        return 'text-lg sm:text-2xl lg:text-4xl';
      case 'grande':
        return 'text-2xl sm:text-4xl lg:text-6xl';
      case 'monumental':
        return 'text-3xl sm:text-5xl lg:text-7xl';
      case 'normal':
      default:
        return 'text-xl sm:text-3xl lg:text-5xl';
    }
  };

  // Headline color preset helper
  const getHeadlineHighlightClass = (theme?: string) => {
    switch (theme) {
      case 'white-silver':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400';
      case 'emerald-neon':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500';
      case 'cyan-electric':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500';
      case 'ruby-red':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-200 to-rose-600';
      case 'purple-violet':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-200 to-pink-500';
      case 'custom':
        return '';
      case 'amber-gold':
      default:
        return 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500';
    }
  };

  // Subheadline sizing helper (compact and breathable on mobile)
  const getSubheadlineSizeClass = (size?: string) => {
    switch (size) {
      case 'compacto':
        return 'text-[11px] sm:text-sm';
      case 'destacado':
        return 'text-xs sm:text-base';
      case 'normal':
      default:
        return 'text-[11px] sm:text-sm lg:text-base';
    }
  };

  // Subheadline color preset helper
  const getSubheadlineColorClass = (theme?: string) => {
    switch (theme) {
      case 'white':
        return 'text-white font-medium';
      case 'amber-200':
        return 'text-amber-200/90';
      case 'emerald-200':
        return 'text-emerald-200/90';
      case 'sky-200':
        return 'text-sky-200/90';
      case 'custom':
        return '';
      case 'slate-300':
      default:
        return 'text-slate-300';
    }
  };

  const headlinePrefix = config.headlinePrefix !== undefined ? config.headlinePrefix : 'Tu Corte Perfecto,';
  const headlineHighlight = config.headlineHighlight !== undefined ? config.headlineHighlight : 'En Tiempo Real';
  const subheadline =
    config.subheadlineText !== undefined && config.subheadlineText.trim() !== ''
      ? config.subheadlineText
      : `${config.slogan}. Selecciona a tu barbero de confianza, consulta los turnos disponibles calculados al instante y recibe tu confirmación directa en WhatsApp.`;

  return (
    <section id="hero" className="relative overflow-hidden bg-slate-950 border-b border-slate-900 pt-3 sm:pt-8 pb-6 sm:pb-16">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-semibold shadow-inner">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Agenda con Renderizado Condicional de Horarios</span>
            </div>

            <h1 className={`${getHeadlineSizeClass(config.headlineSize)} font-black text-white font-['Syne'] tracking-tight leading-[1.15]`}>
              {headlinePrefix}
              {headlinePrefix && headlineHighlight && <br />}
              {headlineHighlight && (
                <span
                  className={
                    config.headlineColorTheme === 'custom'
                      ? undefined
                      : getHeadlineHighlightClass(config.headlineColorTheme)
                  }
                  style={
                    config.headlineColorTheme === 'custom'
                      ? { color: config.headlineCustomColor || '#f59e0b' }
                      : undefined
                  }
                >
                  {headlineHighlight}
                </span>
              )}
            </h1>

            <p
              className={`${getSubheadlineSizeClass(config.subheadlineSize)} ${
                config.subheadlineColorTheme === 'custom'
                  ? ''
                  : getSubheadlineColorClass(config.subheadlineColorTheme)
              } max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed`}
              style={
                config.subheadlineColorTheme === 'custom'
                  ? { color: config.subheadlineCustomColor || '#cbd5e1' }
                  : undefined
              }
            >
              {subheadline}
            </p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 text-[10px] sm:text-xs text-slate-300 pt-0.5 sm:pt-1">
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                Confirmación Inmediata WhatsApp
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                {avgRating} / 5 ({reviews.length} testimonios)
              </span>
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                {config.neighborhood}
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                id="hero-reserve-now-btn"
                onClick={() => onOpenBooking()}
                className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Reservar Turno Ahora</span>
              </button>

              <a
                id="hero-whatsapp-direct-btn"
                href={generateGeneralWhatsAppUrl(config)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-4 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                <span>WhatsApp de la Barbería</span>
              </a>
            </div>

            {/* Quick Social Media & Google Negocios Connectors */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-pink-400 border border-slate-800 hover:border-pink-500/30 text-xs font-semibold transition"
                  title="Instagram Oficial"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram</span>
                </a>
              )}
              {config.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-800 hover:border-blue-500/30 text-xs font-semibold transition"
                  title="Facebook Oficial"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-400" />
                  <span>Facebook</span>
                </a>
              )}
              {config.googleBusinessUrl && (
                <a
                  href={config.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 hover:border-amber-500/30 text-xs font-semibold transition"
                  title="Ficha Oficial en Google Negocios"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Negocios</span>
                </a>
              )}
            </div>

            {/* Barber Lounge Music Vibe quick launcher */}
            <div className="pt-2 flex justify-center lg:justify-start">
              <button
                type="button"
                id="hero-music-launcher-btn"
                onClick={() => {
                  if (!isPlaying) {
                    togglePlayPause();
                  }
                  setIsPlayerOpen(true);
                }}
                className={`inline-flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all text-xs cursor-pointer ${
                  isPlaying
                    ? 'bg-slate-900/95 border-amber-500/60 shadow-lg shadow-amber-500/10 text-white'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-amber-500/40 text-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    {isPlaying ? 'Sonando en Barber Lounge Radio' : 'Música Instrumental para la Ocasión'}
                  </span>
                  <span className="text-xs font-semibold text-white truncate max-w-[280px] block">
                    {isPlaying
                      ? `♫ ${currentTrack.title} (${currentTrack.genreLabel})`
                      : 'Mezcla Aleatoria: Reggaetón, Hip-Hop & Latin Chill'}
                  </span>
                </div>
                <BarberMusicEqualizer isPlaying={isPlaying} barCount={4} heightClass="h-4" />
              </button>
            </div>
          </div>

          {/* Barbers Active Cards Showcase */}
          <div id="barberos" className="lg:col-span-5 space-y-3 sm:space-y-4 scroll-mt-20">
            <div className="p-3.5 sm:p-5 bg-slate-900/80 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-xl space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-xs sm:text-sm">Barberos Disponibles Hoy</h3>
                </div>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                  En Vivo
                </span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {activeBarbers.map((barber) => (
                  <div
                    key={barber.id}
                    onClick={() => onOpenBooking(barber.id)}
                    className="p-2.5 sm:p-3 bg-slate-950/80 hover:bg-slate-950 rounded-xl sm:rounded-2xl border border-slate-800/80 hover:border-amber-500/50 transition flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="relative">
                        <img
                          src={barber.avatar}
                          alt={barber.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-amber-500/40 group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                            {barber.name}
                          </h4>
                          <span className="text-[9px] sm:text-[10px] text-amber-400/80 font-mono">
                            ({barber.nickname})
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-400">{barber.role}</p>
                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" /> {barber.rating}
                          </span>
                          <span>• {barber.startTime} - {barber.endTime} hs</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl border border-amber-500/20 transition cursor-pointer"
                    >
                      Elegir
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => onScrollToSection('turnos')}
                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span>Ver todos los turnos disponibles</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
