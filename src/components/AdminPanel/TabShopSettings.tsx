import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import { BarberShopConfig } from '../../types';
import { Save, Check } from 'lucide-react';
import { SectionHeroCustomizer } from './ShopSettings/SectionHeroCustomizer';
import { SectionGeneralInfo } from './ShopSettings/SectionGeneralInfo';
import { SectionContactAddress } from './ShopSettings/SectionContactAddress';
import { SectionSocialMedia } from './ShopSettings/SectionSocialMedia';
import { SectionMusicSettings } from './ShopSettings/SectionMusicSettings';

export const TabShopSettings: React.FC = () => {
  const { config, updateConfig } = useBarber();

  const [formData, setFormData] = useState<BarberShopConfig>({
    ...config,
    headlinePrefix: config.headlinePrefix ?? 'Tu Corte Perfecto,',
    headlineHighlight: config.headlineHighlight ?? 'En Tiempo Real',
    headlineColorTheme: config.headlineColorTheme ?? 'amber-gold',
    headlineCustomColor: config.headlineCustomColor ?? '#f59e0b',
    headlineSize: config.headlineSize ?? 'normal',

    subheadlineText:
      config.subheadlineText ??
      `${config.slogan}. Selecciona a tu barbero de confianza, consulta los turnos disponibles calculados al instante y recibe tu confirmación directa en WhatsApp.`,
    subheadlineColorTheme: config.subheadlineColorTheme ?? 'slate-300',
    subheadlineCustomColor: config.subheadlineCustomColor ?? '#cbd5e1',
    subheadlineSize: config.subheadlineSize ?? 'normal'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Header Bar with Save button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-['Syne']">
            Ajustes del Negocio, Redacción & Identidad Visual
          </h3>
          <p className="text-slate-400">
            Edita el nombre comercial, eslogan, títulos principales y subtítulos con vista previa en tiempo real.
          </p>
        </div>

        <button
          type="submit"
          id="admin-save-shop-settings-btn"
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {/* Hero Live Preview & Headline/Subheadline Customization */}
      <SectionHeroCustomizer formData={formData} setFormData={setFormData} />

      {/* 1. General Info, Shop Name, Slogan & Logo */}
      <SectionGeneralInfo formData={formData} setFormData={setFormData} />

      {/* 4 & 5. Contact Channels, PIN, Schedule text & Physical GPS Address */}
      <SectionContactAddress formData={formData} setFormData={setFormData} />

      {/* 6. Social Media & Direct Channels */}
      <SectionSocialMedia formData={formData} setFormData={setFormData} />

      {/* Music and Radio Ambient Atmosphere */}
      <SectionMusicSettings />

      {/* Floating Save Button at bottom */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? '¡Cambios Guardados Correctamente!' : 'Guardar Todos los Cambios'}</span>
        </button>
      </div>
    </form>
  );
};
