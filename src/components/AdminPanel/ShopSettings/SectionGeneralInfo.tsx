import React, { useState } from 'react';
import { BarberShopConfig } from '../../../types';
import { Sparkles, Camera, Loader2, Upload, Scissors, Eye, Image as ImageIcon, Check } from 'lucide-react';
import { compressImageFile } from '../../../utils/mediaUpload';
import { ShopLogo } from '../../ShopLogo';

interface SectionGeneralInfoProps {
  formData: BarberShopConfig;
  setFormData: React.Dispatch<React.SetStateAction<BarberShopConfig>>;
}

const LOGO_PRESETS = [
  {
    name: 'Tijeras por defecto',
    url: '',
    description: 'Icono vectorial estilizado en oro'
  },
  {
    name: 'Neón Barber Clásico',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&auto=format&fit=crop&q=80',
    description: 'Sillón vintage e iluminación cálida'
  },
  {
    name: 'Herramientas Pro',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop&q=80',
    description: 'Navajas, peines y tijeras profesionales'
  },
  {
    name: 'Emblema Barbershop',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&auto=format&fit=crop&q=80',
    description: 'Estilo clásico con detalle artesanal'
  },
  {
    name: 'Estilo Urbano Fade',
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&auto=format&fit=crop&q=80',
    description: 'Corte moderno degradado'
  }
];

export const SectionGeneralInfo: React.FC<SectionGeneralInfoProps> = ({ formData, setFormData }) => {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  return (
    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-5">
      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> 1. Nombre Comercial & Logo de la Barbería
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1 text-xs">
            Nombre Comercial de la Barbería *
          </label>
          <input
            type="text"
            required
            id="input-shop-name"
            placeholder="Ej: The Gentleman's Blade Barbería"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none font-semibold"
          />
          <span className="text-[10px] text-slate-500">
            Se actualiza en el encabezado, pie de página, títulos y comprobantes de WhatsApp.
          </span>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1 text-xs">
            Nombre del Administrador / Dueño a Cargo *
          </label>
          <input
            type="text"
            required
            id="input-admin-name"
            placeholder="Ej: Carlos Mendoza"
            value={formData.adminName}
            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-300 font-semibold mb-1 text-xs">
            Eslogan / Frase Lema del Negocio
          </label>
          <input
            type="text"
            id="input-shop-slogan"
            placeholder="Ej: Cortes de alta precisión, afeitados clásicos y estilo que impone presencia."
            value={formData.slogan}
            onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
          />
          <span className="text-[10px] text-slate-500">
            Frase distintiva que acompaña al logo y se muestra en toda la web.
          </span>
        </div>

        {/* Logo / Foto de Perfil del Negocio desde dispositivo */}
        <div className="md:col-span-2 p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" /> Logo Personalizado del Negocio
              </label>
              <p className="text-[11px] text-slate-400">
                Aparece en la barra superior (encabezado), pie de página y comprobantes de la barbería.
              </p>
            </div>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 self-start sm:self-auto">
              PNG, JPG, WebP o URL
            </span>
          </div>

          {/* Vista previa en vivo del encabezado */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400" /> Vista previa en el menú de navegación:
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-950/70 rounded-lg border border-slate-800/80">
              <ShopLogo
                logoUrl={formData.logoUrl}
                shopName={formData.shopName || 'Barbería'}
                sizeClass="w-10 h-10"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white font-['Syne'] truncate">
                    {formData.shopName || 'Nombre de la Barbería'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold rounded uppercase">
                    Turnos en Vivo
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {formData.slogan || 'Eslogan de la barbería'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/60 bg-slate-900 flex-shrink-0 flex items-center justify-center shadow-lg shadow-amber-500/10">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Scissors className="w-7 h-7 text-amber-400 transform -rotate-45" />
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <label className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer flex items-center gap-2 text-xs transition active:scale-95 shadow-md shadow-amber-500/20">
                  {isUploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Subir Imagen de Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingLogo}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoUploadError(null);
                      setIsUploadingLogo(true);
                      try {
                        const compressed = await compressImageFile(file, {
                          maxWidth: 500,
                          maxHeight: 500,
                          quality: 0.85
                        });
                        setFormData((prev) => ({ ...prev, logoUrl: compressed }));
                      } catch (err: any) {
                        setLogoUploadError(err?.message || 'Error al procesar la imagen');
                      } finally {
                        setIsUploadingLogo(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoUrl: '' }))}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>Usar Tijeras por Defecto</span>
                  </button>
                )}
              </div>

              {logoUploadError && (
                <p className="text-[11px] text-rose-400 font-semibold">{logoUploadError}</p>
              )}

              <input
                type="url"
                placeholder="O pega aquí el enlace directo (URL) de tu logo..."
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Plantillas / Presets de Logos Rápidos */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> O elige uno de estos estilos prediseñados:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {LOGO_PRESETS.map((preset) => {
                const isSelected = (formData.logoUrl || '') === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoUrl: preset.url }))}
                    className={`p-2 rounded-xl border text-left transition flex flex-col items-center text-center gap-1.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                        : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 relative">
                      {preset.url ? (
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      ) : (
                        <Scissors className="w-4 h-4 text-amber-400" />
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-amber-300 font-bold" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold leading-tight line-clamp-1">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
