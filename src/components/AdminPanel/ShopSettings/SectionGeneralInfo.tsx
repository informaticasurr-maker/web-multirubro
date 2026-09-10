import React, { useState } from 'react';
import { BarberShopConfig } from '../../../types';
import { Sparkles, Camera, Loader2, Upload } from 'lucide-react';
import { compressImageFile } from '../../../utils/mediaUpload';

interface SectionGeneralInfoProps {
  formData: BarberShopConfig;
  setFormData: React.Dispatch<React.SetStateAction<BarberShopConfig>>;
}

export const SectionGeneralInfo: React.FC<SectionGeneralInfoProps> = ({ formData, setFormData }) => {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  return (
    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> 1. Nombre Comercial & Eslogan del Negocio
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Nombre Comercial de la Barbería *
          </label>
          <input
            type="text"
            required
            id="input-shop-name"
            placeholder="Ej: The Gentleman's Blade Barbería"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
          />
          <span className="text-[10px] text-slate-500">
            Se actualiza en el encabezado, pie de página, títulos y comprobantes de WhatsApp.
          </span>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
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
          <label className="block text-slate-300 font-semibold mb-1">
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
        <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" /> Logo o Foto de Perfil del Negocio
            </label>
            <span className="text-[10px] text-slate-400">Subir desde dispositivo o PC</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/60 bg-slate-900 flex-shrink-0 flex items-center justify-center shadow-md">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-slate-500" />
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
                  <span>Subir Foto de Perfil / Logo</span>
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
                    className="px-2.5 py-2 text-slate-400 hover:text-rose-400 text-xs transition cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>

              {logoUploadError && (
                <p className="text-[11px] text-rose-400 font-semibold">{logoUploadError}</p>
              )}

              <input
                type="url"
                placeholder="O ingresa un enlace URL del logo..."
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
