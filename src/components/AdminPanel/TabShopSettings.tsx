import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import {
  BarberShopConfig,
  HeadlineColorTheme,
  HeadlineSize,
  SubheadlineColorTheme,
  SubheadlineSize
} from '../../types';
import {
  Save,
  Check,
  MapPin,
  Phone,
  Globe,
  Sparkles,
  Type,
  Palette,
  Eye,
  Maximize2,
  Camera,
  Upload,
  Loader2,
  Image as ImageIcon,
  Radio,
  Music,
  Flame,
  Shuffle,
  Play,
  Pause,
  Instagram,
  Facebook,
  MessageCircle,
  ExternalLink,
  Share2,
  Building2
} from 'lucide-react';
import { compressImageFile } from '../../utils/mediaUpload';
import { useMusic } from '../../context/MusicContext';

export const TabShopSettings: React.FC = () => {
  const { config, updateConfig } = useBarber();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playRandomTrack,
    selectedGenre,
    setSelectedGenre,
    setIsPlayerOpen
  } = useMusic();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

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

  // Preset definitions for Headline Color
  const headlineColorPresets: { id: HeadlineColorTheme; label: string; previewClass: string }[] = [
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

  // Preset definitions for Subheadline Color
  const subheadlineColorPresets: { id: SubheadlineColorTheme; label: string; bgClass: string; textColor: string }[] = [
    { id: 'slate-300', label: 'Plata Suave', bgClass: 'bg-slate-300', textColor: '#cbd5e1' },
    { id: 'white', label: 'Blanco Puro', bgClass: 'bg-white', textColor: '#ffffff' },
    { id: 'amber-200', label: 'Ámbar Cálido', bgClass: 'bg-amber-200', textColor: '#fde68a' },
    { id: 'emerald-200', label: 'Menta Suave', bgClass: 'bg-emerald-200', textColor: '#a7f3d0' },
    { id: 'sky-200', label: 'Celeste Hielo', bgClass: 'bg-sky-200', textColor: '#bae6fd' }
  ];

  // Helper for live preview classes
  const getPreviewHeadlineHighlightClass = (theme?: HeadlineColorTheme) => {
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

  const getPreviewHeadlineSizeClass = (size?: HeadlineSize) => {
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

  const getPreviewSubheadlineSizeClass = (size?: SubheadlineSize) => {
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

  const getPreviewSubheadlineColorClass = (theme?: SubheadlineColorTheme) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
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

      {/* ======================================================== */}
      {/* CARD: LIVE VISUAL PREVIEW OF HERO */}
      {/* ======================================================== */}
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
            className={`${getPreviewSubheadlineSizeClass(
              formData.subheadlineSize
            )} ${
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

      {/* ======================================================== */}
      {/* CARD 1: NOMBRE DEL NEGOCIO & ESLOGAN */}
      {/* ======================================================== */}
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
                          setFormData({ ...formData, logoUrl: compressed });
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
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="px-2.5 py-2 text-slate-400 hover:text-rose-400 text-xs transition"
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

      {/* ======================================================== */}
      {/* CARD 2: HEADLINE / TÍTULO PRINCIPAL (Texto, Color, Tamaño) */}
      {/* ======================================================== */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> 2. Headline / Título Principal (Portada Hero)
          </h4>
          <span className="text-[10px] text-slate-400">Redacción, Color y Tamaño</span>
        </div>

        {/* Redacción del Headline */}
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

          {/* Opción de color personalizado libre HEX */}
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

      {/* ======================================================== */}
      {/* CARD 3: SUBHEADLINE / BAJADA (Texto, Color, Tamaño) */}
      {/* ======================================================== */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> 3. Subheadline / Bajada o Subtítulo (Portada Hero)
          </h4>
          <span className="text-[10px] text-slate-400">Redacción, Color y Tamaño</span>
        </div>

        {/* Redacción del Subheadline */}
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

        {/* Tamaño del Subheadline */}
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

        {/* Color del Subheadline */}
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

          {/* Color Personalizado HEX para Subheadline */}
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

      {/* ======================================================== */}
      {/* CARD 4: CONTACTO, WHATSAPP & SEGURIDAD */}
      {/* ======================================================== */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" /> 4. Canales de Contacto, WhatsApp & Seguridad
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              WhatsApp Oficial (Formato Internacional sin +) *
            </label>
            <input
              type="text"
              required
              id="input-shop-whatsapp"
              placeholder="Ej: 5491145678901"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono px-3 py-2 rounded-lg text-xs focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">
              Número al que los clientes envían su confirmación de turno.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Teléfono visible para llamadas</label>
            <input
              type="text"
              value={formData.adminPhone}
              onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">PIN de Acceso Administrador</label>
            <input
              type="password"
              maxLength={8}
              value={formData.adminPin}
              onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Código para ingresar a este panel de administración.</span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Texto de Horarios de Atención</label>
            <input
              type="text"
              value={formData.openingHoursText}
              onChange={(e) => setFormData({ ...formData, openingHoursText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARD 5: DIRECCIÓN & COORDENADAS GPS */}
      {/* ======================================================== */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <h4 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> 5. Dirección Física & Coordenadas GPS
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">Calle y Altura *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Barrio / Zona</label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ciudad / Provincia</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Latitud GPS</label>
            <input
              type="number"
              step="any"
              value={formData.coordinates.lat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
                })
              }
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Longitud GPS</label>
            <input
              type="number"
              step="any"
              value={formData.coordinates.lng}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
                })
              }
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARD 6: REDES SOCIALES & CANALES DIRECTOS                 */}
      {/* ======================================================== */}
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
                  href={`https://wa.me/${formData.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${formData.shopName}, te escribo desde la web oficial.`)}`}
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

          {/* 4. Google Negocios / Google Business Profile */}
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
              Enlaza a tu ficha de Google Maps para que los clientes vean reseñas oficiales y te califiquen con 5 estrellas.
            </p>
          </div>

          {/* 5. TikTok (Opcional) */}
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

          {/* 6. Enlace Directo Google Maps Ruta */}
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

      {/* Music and Lounge Atmosphere Settings Card */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Música Instrumental y Ambiente para la Ocasión
              </h3>
              <p className="text-xs text-slate-400">
                Selección de mezclas instrumentales (Reggaetón Dembow, Hip-Hop, Latin Chill y Neo-Soul)
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
            {isPlaying ? 'Sonando en Vivo' : 'En Pausa'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              Pista Actual Seleccionada
            </span>
            <h4 className="text-sm font-extrabold text-white truncate">{currentTrack.title}</h4>
            <p className="text-xs text-slate-400 truncate">{currentTrack.artist} • {currentTrack.bpm} BPM</p>
            <div className="text-[11px] text-amber-300 font-medium">
              Ocasión: {currentTrack.occasionLabel}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={togglePlayPause}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
              </button>

              <button
                type="button"
                onClick={playRandomTrack}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambiar Aleatorio</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPlayerOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                Abrir Radio
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Filtro de Ritmo Rápido
            </span>
            <p className="text-xs text-slate-400">
              Adapta la música de fondo según el tipo de cliente o corte del día:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { id: 'todos', label: 'Mezcla Aleatoria' },
                { id: 'reggaeton', label: 'Reggaetón Dembow' },
                { id: 'hiphop', label: 'Hip-Hop & Trap' },
                { id: 'latin', label: 'Latin Chill & Bossa' },
                { id: 'neosoul', label: 'Neo-Soul & Jazz' }
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGenre(g.id as any)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    selectedGenre === g.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
