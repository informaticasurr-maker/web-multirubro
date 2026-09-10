import React, { useState } from 'react';

interface BarberCreativeMenuProps {
  onNavigate?: (sectionId: string) => void;
  className?: string;
}

export default function BarberCreativeMenu({ onNavigate, className = '' }: BarberCreativeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const menuItems = [
    { id: 1, title: 'CORTES & ESTILOS', subtitle: 'Clásicos, Fades y Tendencias', href: '#cortes' },
    { id: 2, title: 'BARBA & RITUAL', subtitle: 'Toalla caliente y afeitado tradicional', href: '#barba' },
    { id: 3, title: 'NUESTROS BARBEROS', subtitle: 'Conocé al equipo de especialistas', href: '#barberos' },
    { id: 4, title: 'RESERVAR TURNO', subtitle: 'Confirmación inmediata vía WhatsApp', href: '#turnos' },
    { id: 5, title: 'OPINIONES & RESEÑAS', subtitle: 'Testimonios reales verificados', href: '#resenas' },
    { id: 6, title: 'UBICACIÓN & GPS', subtitle: 'Encuéntranos en Google Maps', href: '#ubicacion' },
  ];

  // Efecto de sonido opcional (usando Web Audio API para no depender de archivos externos)
  const playMetallicClick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignorar si el audio está bloqueado por el navegador
    }
  };

  const toggleMenu = () => {
    playMetallicClick();
    setIsOpen(!isOpen);
  };

  const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    playMetallicClick();
    setIsOpen(false);
    const sectionId = href.replace('#', '');
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* BOTÓN ACTIVADOR: Estilo Hoja de Navaja Metálica */}
      <button
        id="creative-barber-menu-btn"
        onClick={toggleMenu}
        className="relative group overflow-hidden bg-neutral-900 text-amber-400 font-black tracking-wider px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-br-2xl border-l-4 border-amber-400 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs sm:text-sm"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
        }}
        title="Abrir menú desplegable de navegación"
      >
        {/* Destello metálico al hacer hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <span className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-4">
          <span className="text-base sm:text-xl">{isOpen ? '✕' : '⚔️'}</span>
          <span className="whitespace-nowrap">{isOpen ? 'CERRAR' : 'MENÚ'}</span>
        </span>
      </button>

      {/* OVERLAY / PANEL DESPLEGABLE CON FORMA ANGULAR Y CORTES DIAGONALES */}
      <div
        className={`fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 transition-all duration-500 ease-out flex flex-col justify-center items-center ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          // Clip path diagonal asimétrico para la animación de entrada tipo "Navaja"
          clipPath: isOpen 
            ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' 
            : 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
        }}
      >
        {/* Botón cerrar flotante en el overlay */}
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 sm:top-6 sm:right-8 text-amber-400 bg-neutral-900/90 border border-amber-500/40 px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer z-20"
        >
          <span>✕</span>
          <span>CERRAR MENÚ</span>
        </button>

        {/* Fondo decorativo con textura / patrón vintage */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="w-full max-w-2xl px-4 sm:px-6 z-10 flex flex-col gap-2.5 sm:gap-3.5 max-h-[85vh] overflow-y-auto py-6">
          <p className="text-amber-500 font-mono text-[10px] sm:text-xs tracking-widest uppercase text-center mb-1 sm:mb-2">
            /// Seleccioná una sección ///
          </p>

          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleItemClick(e, item.href)}
              onMouseEnter={() => {
                setActiveItem(item.id);
                playMetallicClick();
              }}
              onMouseLeave={() => setActiveItem(null)}
              className="relative group block p-3 sm:p-4 bg-neutral-900/80 border-l-2 border-neutral-800 hover:border-amber-400 transition-all duration-300 transform hover:translate-x-2 sm:hover:translate-x-3 cursor-pointer"
              style={{
                // Esquina cortada tipo estuche/pizarra
                clipPath: 'polygon(0 0, 96% 0, 100% 50%, 96% 100%, 0 100%)',
              }}
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-base sm:text-xl md:text-2xl font-black tracking-wide text-neutral-200 group-hover:text-amber-400 transition-colors font-['Syne']">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm text-neutral-400 font-light mt-0.5 sm:mt-1">
                    {item.subtitle}
                  </p>
                </div>
                <span className="text-amber-500 font-mono text-base sm:text-lg opacity-0 group-hover:opacity-100 transition-opacity pr-4 sm:pr-6">
                  ➔
                </span>
              </div>

              {/* Indicador inferior animado */}
              <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-500 to-transparent w-0 group-hover:w-full transition-all duration-500"></div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
