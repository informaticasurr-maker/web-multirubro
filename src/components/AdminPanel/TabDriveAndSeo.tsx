import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import {
  Cloud,
  Download,
  Upload,
  Bell,
  Search,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Send
} from 'lucide-react';

export const TabDriveAndSeo: React.FC = () => {
  const {
    config,
    updateConfig,
    exportFullBackup,
    importFullBackup,
    resetToDefaultData,
    addPromo,
    promos,
    deletePromo,
    triggerPushNotification
  } = useBarber();

  const [promoTitle, setPromoTitle] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Handle Google Drive / Local JSON Export
  const handleExport = () => {
    const jsonStr = exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${config.shopName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Import Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const success = importFullBackup(event.target.result as string);
        if (success) {
          setImportStatus('¡Copia de seguridad restaurada con éxito!');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          alert('El archivo seleccionado no tiene el formato de respaldo válido.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle sending Push Notification Promo
  const handleSendPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoMessage.trim()) return;

    addPromo({
      title: promoTitle.trim(),
      message: promoMessage.trim(),
      active: true
    });

    setPromoTitle('');
    setPromoMessage('');
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h3 className="text-base font-bold text-white font-['Syne']">
          Sincronización Google Drive, SEO Local & Notificaciones Push
        </h3>
        <p className="text-slate-400">
          Herramientas avanzadas para respaldar los datos del negocio, optimizar el ranking en Google y enviar alertas a clientes.
        </p>
      </div>

      {/* 1. Google Drive & Cloud Backup */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Respaldo y Sincronización con Google Drive</span>
          </div>
          <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-bold rounded border border-sky-500/20">
            Nube Segura
          </span>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          Descarga toda la base de datos (citas, ingresos, configuración del local, fotos de historias, catálogo de barberos y reseñas) en un archivo JSON listo para almacenar o sincronizar con tu Google Drive de la barbería.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Respaldo para Google Drive (.JSON)</span>
          </button>

          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-2 transition cursor-pointer border border-slate-700">
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Restaurar Copia de Seguridad</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('¿Restablecer todos los datos a los valores iniciales de fábrica?')) {
                resetToDefaultData();
              }
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 rounded-xl transition cursor-pointer"
            title="Restablecer datos demo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {importStatus && (
          <p className="text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4" /> {importStatus}
          </p>
        )}
      </div>

      {/* 2. Google My Business & Local SEO Engine */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Posicionamiento en Google según GPS & Google Negocios</span>
          </div>
          <a
            href={config.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Abrir Google Negocios</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Inyección de Schema.org Activa en &lt;head&gt;</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            La página web inyecta dinámicamente el marcado estructurado de Google:
            <code>{' "type": "BarberShop", "geo": { "latitude": ' + config.coordinates.lat + ', "longitude": ' + config.coordinates.lng + ' } '}</code>.
            Esto permite que cuando un usuario busque <em>"barberia cerca de mi"</em> en su teléfono, Google reconozca la proximidad geográfica inmediata del establecimiento.
          </p>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">
            Enlace a tu Perfil de Google Mi Negocio (Google Business)
          </label>
          <input
            type="url"
            value={config.googleBusinessUrl}
            onChange={(e) => updateConfig({ googleBusinessUrl: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* 3. Push Notifications & Broadcast Promos */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Difusión de Notificaciones Push & Promociones</span>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
            Alertas en Pantalla
          </span>
        </div>

        <p className="text-slate-400 text-xs">
          Envía una notificación emergente instantánea a los clientes que visiten la barbería anunciando promociones especiales o recordatorios.
        </p>

        <form onSubmit={handleSendPromo} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Título de la Alerta *</label>
            <input
              type="text"
              required
              placeholder="Ej: 🔥 20% OFF en Barba hoy"
              value={promoTitle}
              onChange={(e) => setPromoTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs"
            />
          </div>

          <div className="md:col-span-2 flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-slate-300 font-semibold mb-1">Mensaje de la Notificación *</label>
              <input
                type="text"
                required
                placeholder="Ej: Quedan sólo 3 turnos disponibles para esta tarde..."
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Enviar Push
            </button>
          </div>
        </form>

        {/* Existing Promos List */}
        <div className="space-y-2 pt-2">
          <label className="block text-slate-400 font-semibold text-[11px]">
            Promociones y Alertas Activas:
          </label>
          {promos.map((p) => (
            <div
              key={p.id}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-white block">{p.title}</strong>
                <p className="text-slate-400 text-[11px]">{p.message}</p>
              </div>
              <button
                onClick={() => deletePromo(p.id)}
                className="text-red-400 hover:text-red-300 text-[11px] underline"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
