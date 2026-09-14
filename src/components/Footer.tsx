import React from 'react';
import { useBarber } from '../context/BarberContext';
import {
  Scissors,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  ShieldCheck,
  Heart,
  MessageCircle,
  Building2,
  ExternalLink
} from 'lucide-react';
import { ShopLogo } from './ShopLogo';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenHistory: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenHistory }) => {
  const { config, isAdmin } = useBarber();

  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${config.shopName}, quiero hacer una consulta.`
  )}`;

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Shop Brand & Slogan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <ShopLogo
                logoUrl={config.logoUrl}
                shopName={config.shopName}
                sizeClass="w-9 h-9"
                iconClass="w-4 h-4 text-amber-400 transform -rotate-45"
              />
              <span className="text-lg font-black text-white font-['Syne'] tracking-tight">
                {config.shopName}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{config.slogan}</p>
            <p className="text-[11px] text-slate-500">
              Administrador a cargo: <strong className="text-slate-300">{config.adminName}</strong>
            </p>
          </div>

          {/* Col 2: Location & Contact */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Contacto & Dirección
            </h4>
            <p className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                {config.address}, {config.neighborhood}, {config.city}
              </span>
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{config.adminPhone}</span>
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </a>
          </div>

          {/* Col 3: Hours & Client tools */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Horarios & Clientes
            </h4>
            <p className="flex items-start gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{config.openingHoursText}</span>
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenHistory}
                className="text-amber-400 hover:underline font-semibold cursor-pointer block"
              >
                Ver Mi Historial de Turnos Agendados
              </button>
            </div>
          </div>

          {/* Col 4: Social Links & Google Negocios */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Redes Sociales & Google Negocios
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {/* Instagram */}
              {config.instagramUrl ? (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-pink-500/40 text-slate-300 hover:text-pink-400 transition flex items-center gap-2 group"
                  title="Instagram Oficial"
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Instagram className="w-3 h-3" />
                  </div>
                  <span className="font-semibold truncate">Instagram</span>
                </a>
              ) : null}

              {/* Facebook */}
              {config.facebookUrl ? (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-400 transition flex items-center gap-2 group"
                  title="Facebook Oficial"
                >
                  <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Facebook className="w-3 h-3" />
                  </div>
                  <span className="font-semibold truncate">Facebook</span>
                </a>
              ) : null}

              {/* WhatsApp */}
              {config.whatsappNumber ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition flex items-center gap-2 group"
                  title="WhatsApp Directo"
                >
                  <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-slate-950 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-3 h-3" />
                  </div>
                  <span className="font-semibold truncate">WhatsApp</span>
                </a>
              ) : null}

              {/* Google Negocios */}
              {config.googleBusinessUrl ? (
                <a
                  href={config.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition flex items-center gap-2 group"
                  title="Google Negocios & Reseñas Oficiales"
                >
                  <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-slate-950 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-3 h-3" />
                  </div>
                  <span className="font-semibold truncate">Google Negocios</span>
                </a>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-500">
              Perfiles oficiales verificados en Google Negocios con ubicación por satélite GPS y atención directa.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {config.shopName}. Todos los derechos reservados.</p>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel Administrador (Conectado)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
