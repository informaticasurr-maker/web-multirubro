import React from 'react';
import {
  BarberShopConfig,
  HeadlineColorTheme,
  HeadlineSize,
  SubheadlineColorTheme,
  SubheadlineSize
} from '../../../types';
import { Eye, Sparkles, Type, Maximize2, Palette } from 'lucide-react';

interface SectionHeroCustomizerProps {
  formData: BarberShopConfig;
  setFormData: React.Dispatch<React.SetStateAction<BarberShopConfig>>;
}

export const headlineColorPresets: { id: HeadlineColorTheme; label: string; previewClass: string }[] = [
  {
    id: 'amber-gold',
    label: 'Oro & Ámbar',
    previewClass: 'bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500'
  },
  {
    id: 'white-silver',
    label: 'Blanco Platino',
    previewClass: 'bg-gradient-to-r from-white via-slate-100 to-slate-400'
  },
  {
    id: 'emerald-neon',
    label: 'Esmeralda Neón',
    previewClass: 'bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500'
  },
  {
    id: 'cyan-electric',
    label: 'Azul Cyan',
    previewClass: 'bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500'
  },
  {
    id: 'ruby-red',
    label: 'Rojo Fuego',
    previewClass: 'bg-gradient-to-r from-rose-400 via-red-200 to-rose-600'
  },
  {
    id: 'purple-violet',
    label: 'Púrpura Imperial',
    previewClass: 'bg-gradient-to-r from-purple-400 via-fuchsia-200 to-pink-500'
  }
];

export const subheadlineColorPresets: {
  id: SubheadlineColorTheme;
  label: string;
  bgClass: string;
  textColor: string;
}[] = [
  { id: 'slate-300', label: 'Plata Suave', bgClass: 'bg-slate-300', textColor: '#cbd5e1' },
  { id: 'white', label: 'Blanco Puro', bgClass: 'bg-white', textColor: '#ffffff' },
  { id: 'amber-200', label: 'Ámbar Cálido', bgClass: 'bg-amber-200', textColor: '#fde68a' },
  { id: 'emerald-200', label: 'Menta Suave', bgClass: 'bg-emerald-200', textColor: '#a7f3d0' },
  { id: 'sky-200', label: 'Celeste Hielo', bgClass: 'bg-sky-200', textColor: '#bae6fd' }
];

export const getPreviewHeadlineHighlightClass = (theme?: HeadlineColorTheme) => {
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

export const getPreviewHeadlineSizeClass = (size?: HeadlineSize) => {
  switch (size) {
    case 'compacto':
      return 'text-2xl sm:text-3xl';
    case 'grande':
      return 'text-4xl sm:text-5xl';
    case 'monumental':
      return 'text-5xl sm:text-6xl';
    case 'normal':
    default:
      return 'text-3xl sm:text-4xl';
  }
};

export const getPreviewSubheadlineSizeClass = (size?: SubheadlineSize) => {
  switch (size) {
    case 'compacto':
      return 'text-xs sm:text-sm';
    case 'destacado':
      return 'text-base sm:text-lg';
    case 'normal':
    default:
      return 'text-sm sm:text-base';
  }
};

export const getPreviewSubheadlineColorClass = (theme?: SubheadlineColorTheme) => {
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

export const SectionHeroCustomizer: React.FC<SectionHeroCustomizerProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      {/* CARD: LIVE VISUAL PREVIEW OF HERO */}
      <div className="p-5 bg-slate-950 rounded-2xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-bl-xl flex items-center gap-1">
          <Eye className="w-3 h-3" /> Vista Previa en Vivo
        </div>

        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{formData.shopName || 'Nombre de la Barbería'}</span>
          </div>

          <h2
            className={`${getPreviewHeadlineSizeClass(
              formData.headlineSize
            )} font-black text-white font-['Syne'] tracking-tight leading-tight`}
          >
            {formData.headlinePrefix || 'Título Principal'}
            {formData.headlinePrefix && formData.headlineHighlight && ' '}
            {formData.headlineHighlight && (
              <span
                className={
                  formData.headlineColorTheme === 'custom'
                    ? undefined
                    : getPreviewHeadlineHighlightClass(formData.headlineColorTheme)
                }
                style={
                  formData.headlineColorTheme === 'custom'
                    ? { color: formData.headlineCustomColor || '#f59e0b' }
                    : undefined
                }
              >
                {formData.headlineHighlight}
              </span>
            )}
          </h2>

          <p
            className={`${getPreviewSubheadlineSizeClass(formData.subheadlineSize)} ${
              formData.subheadlineColorTheme === 'custom'
                ? ''
                : getPreviewSubheadlineColorClass(formData.subheadlineColorTheme)
            } leading-relaxed font-normal`}
            style={
              formData.subheadlineColorTheme === 'custom'
                ? { color: formData.subheadlineCustomColor || '#cbd5e1' }
                : undefined
            }
          >
            {formData.subheadlineText || formData.slogan}
          </p>
        </div>
      </div>

      {/* CARD 2: HEADLINE / TÍTULO PRINCIPAL */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> 2. Headline / Título Principal (Portada Hero)
          </h4>
          <span className="text-[10px] text-slate-400">Redacción, Color y Tamaño</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Texto Inicial del Título (Primera Línea)
            </label>
            <input
              type="text"
              id="input-headline-prefix"
              placeholder="Ej: Tu Corte Perfecto,"
              value={formData.headlinePrefix ?? ''}
              onChange={(e) => setFormData({ ...formData, headlinePrefix: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Texto Destacado del Título (Con Color/Gradiente)
            </label>
            <input
              type="text"
              id="input-headline-highlight"
              placeholder="Ej: En Tiempo Real"
              value={formData.headlineHighlight ?? ''}
              onChange={(e) => setFormData({ ...formData, headlineHighlight: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tamaño del Headline */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3 text-amber-400" /> Tamaño de la Tipografía del Título
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'compacto' as HeadlineSize, label: 'Compacto', desc: 'Discreto (3xl/5xl)' },
              { id: 'normal' as HeadlineSize, label: 'Normal / Estándar', desc: 'Equilibrado (4xl/6xl)' },
              { id: 'grande' as HeadlineSize, label: 'Grande', desc: 'Llamativo (5xl/7xl)' },
              { id: 'monumental' as HeadlineSize, label: 'Monumental', desc: 'Impactante (6xl/8xl)' }
            ].map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setFormData({ ...formData, headlineSize: size.id })}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  formData.headlineSize === size.id
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <p className="font-bold text-xs text-white">{size.label}</p>
                <p className="text-[10px] text-slate-400">{size.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color / Gradiente del Headline */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-amber-400" /> Color y Estilo del Título Destacado
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {headlineColorPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setFormData({ ...formData, headlineColorTheme: preset.id })}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  formData.headlineColorTheme === preset.id
                    ? 'border-amber-500 bg-slate-950 ring-2 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className={`w-full h-5 rounded-lg ${preset.previewClass}`} />
                <span className="text-[10px] font-bold text-slate-300">{preset.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="headline-color-custom-radio"
                name="headlineColorTheme"
                checked={formData.headlineColorTheme === 'custom'}
                onChange={() => setFormData({ ...formData, headlineColorTheme: 'custom' })}
                className="text-amber-500 cursor-pointer"
              />
              <label htmlFor="headline-color-custom-radio" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Usar Color Sólido / Personalizado HEX
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.headlineCustomColor || '#f59e0b'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    headlineColorTheme: 'custom',
                    headlineCustomColor: e.target.value
                  })
                }
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={formData.headlineCustomColor || '#f59e0b'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    headlineColorTheme: 'custom',
                    headlineCustomColor: e.target.value
                  })
                }
                className="w-24 bg-slate-900 border border-slate-700 text-white font-mono px-2 py-1 rounded text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: SUBHEADLINE / BAJADA */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> 3. Subheadline / Bajada o Subtítulo (Portada Hero)
          </h4>
          <span className="text-[10px] text-slate-400">Redacción, Color y Tamaño</span>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Redacción de la Bajada / Párrafo Descriptivo
          </label>
          <textarea
            rows={3}
            id="input-subheadline-text"
            placeholder="Escribe el texto que acompaña al título principal..."
            value={formData.subheadlineText ?? ''}
            onChange={(e) => setFormData({ ...formData, subheadlineText: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <Maximize2 className="w-3 h-3 text-amber-400" /> Tamaño de la Bajada
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compacto' as SubheadlineSize, label: 'Compacto', desc: 'Discreto (14px/16px)' },
              { id: 'normal' as SubheadlineSize, label: 'Normal / Estándar', desc: 'Recomendado (16px/18px)' },
              { id: 'destacado' as SubheadlineSize, label: 'Destacado', desc: 'Mayor presencia (18px/20px)' }
            ].map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setFormData({ ...formData, subheadlineSize: size.id })}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  formData.subheadlineSize === size.id
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <p className="font-bold text-xs text-white">{size.label}</p>
                <p className="text-[10px] text-slate-400">{size.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-amber-400" /> Color de la Bajada
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {subheadlineColorPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setFormData({ ...formData, subheadlineColorTheme: preset.id })}
                className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                  formData.subheadlineColorTheme === preset.id
                    ? 'border-amber-500 bg-slate-950 ring-2 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${preset.bgClass} border border-slate-700`} />
                <span className="text-[10px] font-semibold text-slate-300">{preset.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="subheadline-color-custom-radio"
                name="subheadlineColorTheme"
                checked={formData.subheadlineColorTheme === 'custom'}
                onChange={() => setFormData({ ...formData, subheadlineColorTheme: 'custom' })}
                className="text-amber-500 cursor-pointer"
              />
              <label htmlFor="subheadline-color-custom-radio" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Usar Color Personalizado HEX
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.subheadlineCustomColor || '#cbd5e1'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subheadlineColorTheme: 'custom',
                    subheadlineCustomColor: e.target.value
                  })
                }
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={formData.subheadlineCustomColor || '#cbd5e1'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subheadlineColorTheme: 'custom',
                    subheadlineCustomColor: e.target.value
                  })
                }
                className="w-24 bg-slate-900 border border-slate-700 text-white font-mono px-2 py-1 rounded text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
