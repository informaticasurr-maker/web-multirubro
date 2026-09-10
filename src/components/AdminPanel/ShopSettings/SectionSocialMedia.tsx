import React from 'react';
import { BarberShopConfig } from '../../../types';
import {
  Share2,
  Instagram,
  Facebook,
  MessageCircle,
  Building2,
  Globe,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface SectionSocialMediaProps {
  formData: BarberShopConfig;
  setFormData: React.Dispatch<React.SetStateAction<BarberShopConfig>>;
}

export const SectionSocialMedia: React.FC<SectionSocialMediaProps> = ({
  formData,
  setFormData
}) => {
  return (
    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> 6. Redes Sociales & Canales Directos (Listo para Enlazar)
          </h4>
          <p className="text-slate-400 text-xs mt-0.5">
            Configura los perfiles de tu barbería: Instagram, Facebook, WhatsApp y Google Negocios para tus clientes.
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold self-start sm:self-auto">
          Sincronización Inmediata
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Instagram */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-pink-500/30 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white">
                <Instagram className="w-3 h-3" />
              </div>
              <span>Instagram Oficial</span>
            </label>
            {formData.instagramUrl && (
              <a
                href={formData.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
              >
                <span>Probar Enlace</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            placeholder="https://instagram.com/tu_barberia"
            value={formData.instagramUrl}
            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-pink-500 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500">
            Aparecerá en el encabezado, historias y pie de página para tus clientes.
          </p>
        </div>

        {/* 2. Facebook */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Facebook className="w-3 h-3" />
              </div>
              <span>Página de Facebook</span>
            </label>
            {formData.facebookUrl && (
              <a
                href={formData.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Probar Enlace</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            placeholder="https://facebook.com/tu_barberia"
            value={formData.facebookUrl}
            onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500">
            Página oficial de la barbería en Facebook.
          </p>
        </div>

        {/* 3. WhatsApp Directo */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950">
                <MessageCircle className="w-3 h-3" />
              </div>
              <span>WhatsApp Atención al Cliente</span>
            </label>
            {formData.whatsappNumber && (
              <a
                href={`https://wa.me/${formData.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hola ${formData.shopName}, te escribo desde la web oficial.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>Probar Chat</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="text"
            placeholder="Ej: 5491145678901 (sin + ni espacios)"
            value={formData.whatsappNumber}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 text-white font-mono px-3 py-2 rounded-lg text-xs focus:border-emerald-500 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500">
            Número internacional para confirmación de citas y botón de chat en vivo.
          </p>
        </div>

        {/* 4. Google Negocios */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold text-xs flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-slate-950">
                <Building2 className="w-3 h-3" />
              </div>
              <span>Google Negocios (Google My Business / Maps)</span>
            </label>
            {formData.googleBusinessUrl && (
              <a
                href={formData.googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Ver Ficha Google</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            placeholder="https://business.google.com o enlace a tu ficha de Google Maps"
            value={formData.googleBusinessUrl}
            onChange={(e) => setFormData({ ...formData, googleBusinessUrl: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
          />
          <p className="text-[10px] text-slate-500">
            Enlaza a tu ficha de Google Maps para que los clientes vean reseñas oficiales.
          </p>
        </div>

        {/* 5. TikTok */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>TikTok (Opcional)</span>
            </label>
            {formData.tiktokUrl && (
              <a
                href={formData.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>Probar</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            placeholder="https://tiktok.com/@tu_barberia"
            value={formData.tiktokUrl}
            onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-slate-600 focus:outline-none"
          />
        </div>

        {/* 6. Enlace Directo Google Maps */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Enlace Directo Google Maps para Cómo Llegar</span>
            </label>
            {formData.googleMapsUrl && (
              <a
                href={formData.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Abrir Ruta</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <input
            type="url"
            placeholder="https://maps.google.com/?q=..."
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
