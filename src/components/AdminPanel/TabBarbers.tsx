import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import { Barber } from '../../types';
import {
  UserPlus,
  Edit2,
  Trash2,
  Clock,
  Check,
  X,
  ShieldAlert,
  Upload,
  Camera,
  Loader2,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { compressImageFile } from '../../utils/mediaUpload';

export const TabBarbers: React.FC = () => {
  const { barbers, saveBarber, deleteBarber } = useBarber();

  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const emptyBarber: Barber = {
    id: `barber-${Date.now()}`,
    name: '',
    nickname: '',
    role: 'Barbero Especialista',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    phone: '',
    rating: 5.0,
    reviewCount: 0,
    specialties: ['Corte Clásico', 'Degradado Fade'],
    workDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    startTime: '09:00',
    endTime: '20:00',
    breakStart: '14:00',
    breakEnd: '15:00',
    slotDurationMinutes: 45,
    active: true
  };

  const dayLabels = [
    { num: 0, label: 'Dom' },
    { num: 1, label: 'Lun' },
    { num: 2, label: 'Mar' },
    { num: 3, label: 'Mié' },
    { num: 4, label: 'Jue' },
    { num: 5, label: 'Vie' },
    { num: 6, label: 'Sáb' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBarber) return;
    if (!editingBarber.name.trim()) {
      alert('Por favor indica el nombre del barbero.');
      return;
    }
    saveBarber(editingBarber);
    setEditingBarber(null);
    setIsCreating(false);
  };

  const toggleWorkDay = (dayIndex: number) => {
    if (!editingBarber) return;
    const exists = editingBarber.workDays.includes(dayIndex);
    const updated = exists
      ? editingBarber.workDays.filter((d) => d !== dayIndex)
      : [...editingBarber.workDays, dayIndex].sort();
    setEditingBarber({ ...editingBarber, workDays: updated });
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-['Syne']">
            Equipo de Barberos & Horarios de Atención
          </h3>
          <p className="text-slate-400">
            Define los días de trabajo, descansos y franja horaria de cada barbero para el renderizado condicional.
          </p>
        </div>
        {!editingBarber && (
          <button
            onClick={() => {
              setEditingBarber(emptyBarber);
              setIsCreating(true);
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Agregar Barbero
          </button>
        )}
      </div>

      {/* Barber Edit Modal / Form */}
      {editingBarber && (
        <form onSubmit={handleSave} className="p-5 bg-slate-900 rounded-2xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">
              {isCreating ? 'Nuevo Barbero' : `Editar Horarios de ${editingBarber.name}`}
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingBarber(null);
                setIsCreating(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={editingBarber.name}
                onChange={(e) => setEditingBarber({ ...editingBarber, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Apodo / Nombre Corto *</label>
              <input
                type="text"
                required
                value={editingBarber.nickname}
                onChange={(e) => setEditingBarber({ ...editingBarber, nickname: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cargo / Especialidad</label>
              <input
                type="text"
                value={editingBarber.role}
                onChange={(e) => setEditingBarber({ ...editingBarber, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Teléfono / WhatsApp Barbero</label>
              <input
                type="text"
                value={editingBarber.phone}
                onChange={(e) => setEditingBarber({ ...editingBarber, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg"
              />
            </div>
            {/* Foto de Perfil / Avatar con carga directa desde dispositivo o PC */}
            <div className="md:col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" /> Foto de Perfil del Barbero
                </label>
                <span className="text-[10px] text-slate-400">Desde PC, Celular o Cámara</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Round Avatar Preview */}
                <div className="relative group/avatar flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/60 bg-slate-900 shadow-md">
                    {editingBarber.avatar ? (
                      <img
                        src={editingBarber.avatar}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload Actions */}
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <label className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer flex items-center gap-2 text-xs transition active:scale-95 shadow-md shadow-amber-500/20">
                      {isUploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>Subir Foto de Perfil</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingAvatar}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadError(null);
                          setIsUploadingAvatar(true);
                          try {
                            const compressed = await compressImageFile(file, {
                              maxWidth: 600,
                              maxHeight: 600,
                              quality: 0.85
                            });
                            setEditingBarber({ ...editingBarber, avatar: compressed });
                          } catch (err: any) {
                            setUploadError(err?.message || 'Error al procesar la foto');
                          } finally {
                            setIsUploadingAvatar(false);
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
                      <span>{showUrlInput ? 'Ocultar Enlace URL' : 'O usar Enlace URL'}</span>
                    </button>

                    {editingBarber.avatar && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingBarber({
                            ...editingBarber,
                            avatar:
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                          })
                        }
                        className="px-2.5 py-2 text-slate-400 hover:text-rose-400 text-xs transition"
                        title="Restablecer avatar por defecto"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Formatos JPG, PNG, WEBP. Optimizado automáticamente para carga ultra rápida.
                  </p>

                  {uploadError && (
                    <p className="text-[11px] text-rose-400 font-semibold">{uploadError}</p>
                  )}

                  {showUrlInput && (
                    <div className="pt-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... o enlace web directo"
                        value={editingBarber.avatar}
                        onChange={(e) => setEditingBarber({ ...editingBarber, avatar: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Working Days Toggles */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Días de la semana que atiende en el local:
            </label>
            <div className="flex flex-wrap gap-2">
              {dayLabels.map(({ num, label }) => {
                const active = editingBarber.workDays.includes(num);
                return (
                  <button
                    type="button"
                    key={num}
                    onClick={() => toggleWorkDay(num)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {label} {active ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hours & Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Hora Inicio</label>
              <input
                type="time"
                value={editingBarber.startTime}
                onChange={(e) => setEditingBarber({ ...editingBarber, startTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-2 py-1.5 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Hora Cierre</label>
              <input
                type="time"
                value={editingBarber.endTime}
                onChange={(e) => setEditingBarber({ ...editingBarber, endTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-2 py-1.5 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Inicio Almuerzo</label>
              <input
                type="time"
                value={editingBarber.breakStart || ''}
                onChange={(e) => setEditingBarber({ ...editingBarber, breakStart: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-2 py-1.5 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Fin Almuerzo</label>
              <input
                type="time"
                value={editingBarber.breakEnd || ''}
                onChange={(e) => setEditingBarber({ ...editingBarber, breakEnd: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white px-2 py-1.5 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={editingBarber.active}
                onChange={(e) => setEditingBarber({ ...editingBarber, active: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span>Barbero Activo para Reservas</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingBarber(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
              >
                Guardar Barbero
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Barbers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barbers.map((b) => (
          <div
            key={b.id}
            className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <img src={b.avatar} alt={b.name} className="w-14 h-14 rounded-full object-cover border border-amber-500/50" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{b.name}</h4>
                  <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-mono">
                    {b.nickname}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{b.role}</p>
                <p className="text-[11px] text-slate-300 flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {b.startTime} a {b.endTime} hs {b.breakStart ? `(Almuerzo ${b.breakStart}-${b.breakEnd})` : ''}
                </p>
                <div className="flex gap-1 text-[9px] text-slate-400">
                  Días: {b.workDays.map((d) => dayLabels.find((dl) => dl.num === d)?.label).join(', ')}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setEditingBarber(b);
                  setIsCreating(false);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg transition"
                title="Editar horario"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {barbers.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar al barbero ${b.name}?`)) {
                      deleteBarber(b.id);
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
