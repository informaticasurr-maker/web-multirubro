import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import { GalleryItem } from '../../types';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Upload,
  Heart,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Film
} from 'lucide-react';
import { compressImageFile, validateAndReadVideoFile } from '../../utils/mediaUpload';

export const TabGallery: React.FC = () => {
  const { gallery, barbers, addGalleryItem, deleteGalleryItem } = useBarber();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [category, setCategory] = useState('Degradados (Fade)');
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ durationText: string; sizeMb: number } | null>(null);

  const categories = ['Degradados (Fade)', 'Barbas y Ritual', 'Estilo Urbano', 'Cortes Clásicos', 'Colorimetría'];

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
        setMediaType('video');
        setMediaUrl(result.dataUrl);
        setVideoInfo({
          durationText: result.formattedDuration,
          sizeMb: result.fileSizeMb
        });
      } else {
        // Compress photo for snappy loading
        const compressed = await compressImageFile(file, {
          maxWidth: 700,
          maxHeight: 700,
          quality: 0.70
        });
        setMediaType('image');
        setMediaUrl(compressed);
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
      alert('Por favor agrega la imagen/video y un título para el corte.');
      return;
    }

    addGalleryItem({
      title: title.trim(),
      description: description.trim(),
      mediaUrl: mediaUrl.trim(),
      mediaType,
      category,
      barberId: selectedBarberId
    });

    setIsAdding(false);
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setVideoInfo(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-['Syne']">
            Galería Permanente de Trabajos & Cortes
          </h3>
          <p className="text-slate-400">
            Sube fotos en alta resolución y videos cortos demostrando la técnica de corte de cada barbero.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Agregar a Galería
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 bg-slate-900 rounded-2xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">Nuevo Trabajo en Galería</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Título del Corte *</label>
              <input
                type="text"
                required
                placeholder="Ej: Taper Fade Texturizado"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Barbero Realizador</label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Formato</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="galMediaType"
                    checked={mediaType === 'image'}
                    onChange={() => setMediaType('image')}
                    className="text-amber-500"
                  />
                  <span>Fotografía</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="galMediaType"
                    checked={mediaType === 'video'}
                    onChange={() => setMediaType('video')}
                    className="text-amber-500"
                  />
                  <span>Video Corto</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  {mediaType === 'video' ? (
                    <Film className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                  )}
                  Archivo Multimedia de Galería (Foto o Video Corto)
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
                    name="galMediaType"
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
                    name="galMediaType"
                    checked={mediaType === 'video'}
                    onChange={() => setMediaType('video')}
                    className="text-amber-500"
                  />
                  <span>Video Corto (máx. 2 min)</span>
                </label>
              </div>

              {/* Upload Buttons */}
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
                      : 'Subir archivo desde PC o celular'}
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
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('');
                      setVideoInfo(null);
                      setUploadError(null);
                    }}
                    className="px-2.5 py-2 text-slate-400 hover:text-rose-400 text-xs transition"
                  >
                    Quitar archivo
                  </button>
                )}
              </div>

              {/* Validation Status / Badges */}
              {videoInfo && (
                <div className="flex items-center gap-2 p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Video verificado:</strong> {videoInfo.durationText} ({videoInfo.sizeMb} MB) — Duración dentro del límite máximo de 2 min.
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
                    Vista previa del trabajo a publicar:
                  </p>
                  <div className="max-w-md mx-auto rounded-lg overflow-hidden bg-black aspect-video max-h-56 flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video
                        src={mediaUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
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
              <label className="block text-slate-300 font-semibold mb-1">Descripción del Estilo</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
            >
              Guardar en Galería
            </button>
          </div>
        </form>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-2">
              {item.mediaType === 'video' ? (
                <video src={item.mediaUrl} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
              )}
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-amber-300 font-bold">
                {item.category}
              </span>
              <button
                onClick={() => deleteGalleryItem(item.id)}
                className="absolute top-2 right-2 p-1.5 rounded bg-black/70 hover:bg-red-600 text-white transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs truncate">{item.title}</h4>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Heart className="w-3 h-3 text-red-400 fill-current" /> {item.likes}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
