import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import { StoryItem, StoryScope } from '../../types';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Eye,
  Upload,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Film,
  Calendar,
  Flame
} from 'lucide-react';
import { compressImageFile, validateAndReadVideoFile, generateVideoPosterThumbnail } from '../../utils/mediaUpload';

export const TabStories: React.FC = () => {
  const { stories, barbers, addStory, deleteStory } = useBarber();

  const [isAdding, setIsAdding] = useState(false);
  const [scope, setScope] = useState<StoryScope>('dia');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ durationText: string; sizeMb: number } | null>(null);
  const [filterScope, setFilterScope] = useState<'all' | StoryScope>('all');

  // Handle local file upload with strict video 2-min limit and image compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setVideoInfo(null);
    setIsUploading(true);

    try {
      if (file.type.startsWith('video/')) {
        // Enforce maximum 120 seconds (2 minutes)
        const result = await validateAndReadVideoFile(file, 120);
        const poster = await generateVideoPosterThumbnail(file);
        setMediaType('video');
        setMediaUrl(result.dataUrl);
        setThumbnailUrl(poster);
        setVideoInfo({
          durationText: result.formattedDuration,
          sizeMb: result.fileSizeMb
        });
      } else {
        // Compress photo for snappy loading
        const compressed = await compressImageFile(file, {
          maxWidth: 500,
          maxHeight: 800,
          quality: 0.55
        });
        setMediaType('image');
        setMediaUrl(compressed);
        setThumbnailUrl('');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error al procesar el archivo seleccionado.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim() || !title.trim()) {
      alert('Por favor agrega la imagen o video y un título para la historia.');
      return;
    }

    const barber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];

    // Expiration duration based on scope
    const durationHours = scope === 'dia' ? 24 : scope === 'semana' ? 24 * 7 : 24 * 30;
    const defaultTag = scope === 'dia' ? 'Corte del Día' : scope === 'semana' ? 'Noticia Semanal' : 'Anuncio del Mes';

    addStory({
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      mediaType,
      title: title.trim(),
      caption: caption.trim() || (scope === 'dia' ? 'Corte del día en la barbería.' : 'Novedad de la barbería.'),
      barberName: scope === 'dia' ? (barber ? barber.nickname : 'Staff') : (barber ? `${barber.nickname} (Staff)` : 'Staff Barbería'),
      barberAvatar: barber ? barber.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      expiresAt: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
      scope,
      tag: customTag.trim() || defaultTag
    });

    setIsAdding(false);
    setMediaUrl('');
    setThumbnailUrl('');
    setTitle('');
    setCaption('');
    setCustomTag('');
    setVideoInfo(null);
    setUploadError(null);
  };

  const filteredStories = stories.filter((s) => {
    if (filterScope === 'all') return true;
    return (s.scope || 'dia') === filterScope;
  });

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white font-['Syne'] flex items-center gap-2">
            <span>Historias & Noticias (Formato Facebook / Tarjetas)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Día • Semana • Mes
            </span>
          </h3>
          <p className="text-slate-400">
            Publica cortes del día (24h), promociones de la semana (7 días) o sorteos y avisos del mes (30 días).
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Crear Historia / Noticia
          </button>
        )}
      </div>

      {/* Add Story Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 bg-slate-900 rounded-2xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">Publicar Nueva Historia o Noticia</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scope selection: Día, Semana, Mes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Tipo de Publicación / Alcance Temporal *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('dia')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  scope === 'dia'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className={`w-4 h-4 mt-0.5 ${scope === 'dia' ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <h5 className="font-bold text-xs text-white">Historia del Día</h5>
                  <p className="text-[10px] text-slate-400">Corte recién hecho por un barbero. Dura 24 horas.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('semana')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  scope === 'semana'
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className={`w-4 h-4 mt-0.5 ${scope === 'semana' ? 'text-sky-400' : 'text-slate-500'}`} />
                <div>
                  <h5 className="font-bold text-xs text-white">Noticia de la Semana</h5>
                  <p className="text-[10px] text-slate-400">Promociones, horarios o tips semanales. Dura 7 días.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('mes')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition cursor-pointer ${
                  scope === 'mes'
                    ? 'bg-purple-500/15 border-purple-500 text-white shadow-md shadow-purple-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className={`w-4 h-4 mt-0.5 ${scope === 'mes' ? 'text-purple-400' : 'text-slate-500'}`} />
                <div>
                  <h5 className="font-bold text-xs text-white">Anuncio del Mes</h5>
                  <p className="text-[10px] text-slate-400">Sorteos, nuevos productos o anuncios mensuales. Dura 30 días.</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {scope === 'dia' ? 'Título del Corte / Estilo *' : 'Titular de la Noticia o Promoción *'}
              </label>
              <input
                type="text"
                required
                placeholder={scope === 'dia' ? 'Ej: High Fade con Pompadour' : scope === 'semana' ? 'Ej: Promo 2x1 Martes & Miércoles' : 'Ej: Gran Sorteo VIP de Fin de Mes'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {scope === 'dia' ? 'Barbero Creador' : 'Barbero o Emisor'}
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.nickname})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  {mediaType === 'video' ? (
                    <Film className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                  )}
                  Archivo Multimedia (Foto o Video Corto)
                </label>
                <span className="text-[10px] text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Videos: Duración máxima 2 minutos
                </span>
              </div>

              {/* Type Switcher */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="radio"
                    name="mediaType"
                    checked={mediaType === 'image'}
                    onChange={() => {
                      setMediaType('image');
                      setVideoInfo(null);
                    }}
                    className="text-amber-500"
                  />
                  <span>Fotografía</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="radio"
                    name="mediaType"
                    checked={mediaType === 'video'}
                    onChange={() => setMediaType('video')}
                    className="text-amber-500"
                  />
                  <span>Video Corto (máx. 2 min)</span>
                </label>
              </div>

              {/* Upload actions */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer flex items-center gap-2 text-xs transition active:scale-95 shadow-md shadow-amber-500/20">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {isUploading
                      ? 'Procesando y validando duración...'
                      : 'Subir desde este dispositivo o PC'}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {mediaUrl && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-4 h-4" /> Archivo cargado
                  </span>
                )}
              </div>

              {videoInfo && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <Film className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Video verificado:</strong> {videoInfo.durationText} ({videoInfo.sizeMb} MB) — Cumple con el límite máximo de 2 minutos.
                  </span>
                </div>
              )}

              {uploadError && (
                <div className="flex items-start gap-2 p-2.5 bg-rose-950/50 border border-rose-500/50 rounded-lg text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Optional direct URL input */}
              <div className="pt-1">
                <input
                  type="url"
                  placeholder="O pega aquí un enlace URL directo de la foto o video..."
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setVideoInfo(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono"
                />
              </div>

              {/* Media Preview Box */}
              {mediaUrl && (
                <div className="mt-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">
                    Vista previa del contenido (Formato Historia):
                  </p>
                  <div className="max-w-xs mx-auto rounded-xl overflow-hidden bg-black aspect-[9/14] max-h-64 flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video
                        src={mediaUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Descripción / Detalle de la Noticia</label>
              <input
                type="text"
                placeholder={scope === 'dia' ? 'Ej: Degradado a piel impecable. Trabajo terminado hace instantes.' : 'Ej: Aprovecha 50% de descuento en el segundo turno reservando esta semana.'}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
            >
              Publicar en {scope === 'dia' ? 'Historias del Día' : scope === 'semana' ? 'Noticias de la Semana' : 'Anuncios del Mes'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs in Admin */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setFilterScope('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
            filterScope === 'all'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Todas ({stories.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterScope('dia')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
            filterScope === 'dia'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3 h-3" /> Del Día ({stories.filter((s) => (s.scope || 'dia') === 'dia').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterScope('semana')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
            filterScope === 'semana'
              ? 'bg-sky-500 text-slate-950'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3 h-3" /> De la Semana ({stories.filter((s) => s.scope === 'semana').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterScope('mes')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
            filterScope === 'mes'
              ? 'bg-purple-500 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" /> Del Mes ({stories.filter((s) => s.scope === 'mes').length})
        </button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredStories.map((story) => {
          const stScope = story.scope || 'dia';
          const scopeBadgeColor =
            stScope === 'semana'
              ? 'bg-sky-500/90 text-slate-950'
              : stScope === 'mes'
              ? 'bg-purple-500/90 text-white'
              : 'bg-amber-500/90 text-slate-950';

          const scopeLabel =
            stScope === 'semana' ? 'Semana' : stScope === 'mes' ? 'Mes' : 'Día';

          return (
            <div
              key={story.id}
              className="p-2.5 sm:p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between"
            >
              <div className="relative aspect-[9/13] w-full rounded-lg overflow-hidden bg-black mb-2">
                {story.mediaType === 'video' ? (
                  <video src={story.mediaUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={story.mediaUrl} alt={story.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${scopeBadgeColor}`}>
                    {scopeLabel}
                  </span>
                  {story.mediaType === 'video' && (
                    <span className="px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-amber-300 font-bold">
                      Video
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteStory(story.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition cursor-pointer"
                  title="Eliminar historia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs truncate">{story.title}</h4>
                <p className="text-[10px] text-slate-400 truncate">{story.barberName}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {story.viewsCount} vistas
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium">Activo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
