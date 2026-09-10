import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import { ServiceItem } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { compressImageFile } from '../../utils/mediaUpload';

export const TabServices: React.FC = () => {
  const { services, saveService, deleteService, config } = useBarber();

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const emptyService: ServiceItem = {
    id: `srv-${Date.now()}`,
    name: '',
    description: '',
    price: 8000,
    durationMinutes: 45,
    category: 'corte',
    popular: false,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80'
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (!editingService.name.trim()) {
      alert('Por favor indica el nombre del servicio.');
      return;
    }
    saveService(editingService);
    setEditingService(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-['Syne']">
            Catálogo de Servicios y Precios
          </h3>
          <p className="text-slate-400">
            Define la duración exacta en minutos de cada servicio para calcular los turnos automáticamente.
          </p>
        </div>
        {!editingService && (
          <button
            onClick={() => {
              setEditingService(emptyService);
              setIsCreating(true);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Servicio
          </button>
        )}
      </div>

      {/* Service Form */}
      {editingService && (
        <form onSubmit={handleSave} className="p-5 bg-slate-900 rounded-2xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">
              {isCreating ? 'Agregar Nuevo Servicio' : `Editar ${editingService.name}`}
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingService(null);
                setIsCreating(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre del Servicio *</label>
              <input
                type="text"
                required
                value={editingService.name}
                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <select
                value={editingService.category}
                onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg capitalize"
              >
                <option value="corte">Corte</option>
                <option value="barba">Barba</option>
                <option value="combo">Combo VIP</option>
                <option value="color">Colorimetría</option>
                <option value="facial">Tratamiento Facial</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Precio ({config.currencySymbol}) *</label>
              <input
                type="number"
                required
                min={0}
                value={editingService.price}
                onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Duración (Minutos) *</label>
              <input
                type="number"
                required
                min={15}
                max={240}
                step={5}
                value={editingService.durationMinutes}
                onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Descripción del Servicio</label>
              <textarea
                rows={2}
                value={editingService.description}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded-lg"
              />
            </div>

            {/* Foto Ilustrativa del Servicio con subida desde PC o Móvil */}
            <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" /> Foto Ilustrativa del Servicio
                </label>
                <span className="text-[10px] text-slate-400">Subir desde dispositivo o PC</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Image Preview Box */}
                <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-amber-500/50 bg-slate-900 flex-shrink-0 shadow-md">
                  {editingService.image ? (
                    <img
                      src={editingService.image}
                      alt="Foto del servicio"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload Buttons */}
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <label className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer flex items-center gap-2 text-xs transition active:scale-95 shadow-md shadow-amber-500/20">
                      {isUploadingPhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Subir Foto desde PC / Celular</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingPhoto}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadError(null);
                          setIsUploadingPhoto(true);
                          try {
                            const compressed = await compressImageFile(file, {
                              maxWidth: 800,
                              maxHeight: 600,
                              quality: 0.85
                            });
                            setEditingService({ ...editingService, image: compressed });
                          } catch (err: any) {
                            setUploadError(err?.message || 'Error al procesar la imagen');
                          } finally {
                            setIsUploadingPhoto(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput((prev) => !prev)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{showUrlInput ? 'Ocultar Enlace URL' : 'O pegar Enlace URL'}</span>
                    </button>

                    {editingService.image && (
                      <button
                        type="button"
                        onClick={() => setEditingService({ ...editingService, image: '' })}
                        className="px-2.5 py-2 text-slate-400 hover:text-rose-400 text-xs transition"
                        title="Quitar foto"
                      >
                        Quitar Foto
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Se recomienda imagen horizontal (4:3 o 16:9). Se comprime automáticamente para máxima velocidad.
                  </p>

                  {uploadError && (
                    <p className="text-[11px] text-rose-400 font-semibold">{uploadError}</p>
                  )}

                  {showUrlInput && (
                    <div className="pt-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... o enlace web de la foto"
                        value={editingService.image || ''}
                        onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={editingService.popular || false}
                onChange={(e) => setEditingService({ ...editingService, popular: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span>Destacar como "Más Pedido"</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
              >
                Guardar Servicio
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
          >
            <div className="flex gap-3">
              {s.image && (
                <img src={s.image} alt={s.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{s.name}</h4>
                  {s.popular && (
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-bold">
                      Top
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-3 text-slate-300 pt-1">
                  <span className="font-black text-amber-400 font-['Syne']">
                    {config.currencySymbol}{s.price.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" /> {s.durationMinutes} min
                  </span>
                  <span className="capitalize text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                    {s.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setEditingService(s);
                  setIsCreating(false);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition"
                title="Editar servicio"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {services.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el servicio ${s.name}?`)) {
                      deleteService(s.id);
                    }
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-red-950/60 text-red-400 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
