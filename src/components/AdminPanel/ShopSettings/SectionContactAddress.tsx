import React, { useState } from 'react';
import { BarberShopConfig } from '../../../types';
import { Phone, MapPin, Navigation, Search, CheckCircle2, AlertCircle, ExternalLink, Sparkles } from 'lucide-react';

interface SectionContactAddressProps {
  formData: BarberShopConfig;
  setFormData: React.Dispatch<React.SetStateAction<BarberShopConfig>>;
}

export const SectionContactAddress: React.FC<SectionContactAddressProps> = ({
  formData,
  setFormData
}) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Automatically geocode the current address using OpenStreetMap Nominatim
  const handleAutoGeocode = async () => {
    if (!formData.address || !formData.address.trim()) {
      setGeoFeedback({ type: 'error', text: 'Por favor ingresa primero la calle y altura.' });
      return;
    }

    setGeoLoading(true);
    setGeoFeedback(null);

    try {
      const searchQueries = [
        `${formData.address}, ${formData.neighborhood || ''}, ${formData.city || ''}`.trim(),
        `${formData.address}, ${formData.city || ''}`.trim(),
        formData.address.trim()
      ];

      let foundLocation: { lat: number; lon: number; display_name: string } | null = null;

      for (const query of searchQueries) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'es'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            foundLocation = {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
              display_name: data[0].display_name
            };
            break;
          }
        }
      }

      if (foundLocation && !isNaN(foundLocation.lat) && !isNaN(foundLocation.lon)) {
        const newLat = parseFloat(foundLocation.lat.toFixed(6));
        const newLng = parseFloat(foundLocation.lon.toFixed(6));

        setFormData((prev) => ({
          ...prev,
          coordinates: {
            lat: newLat,
            lng: newLng
          },
          googleMapsUrl: `https://maps.google.com/?q=${newLat},${newLng}`,
          wazeUrl: `https://waze.com/ul?ll=${newLat},${newLng}&navigate=yes`
        }));

        setGeoFeedback({
          type: 'success',
          text: `¡Coordenadas encontradas y sincronizadas! (${newLat}, ${newLng})`
        });
      } else {
        setGeoFeedback({
          type: 'error',
          text: 'No se encontraron coordenadas automáticas para esa dirección. Puedes ingresar la Latitud/Longitud manualmente o usar el botón de GPS de tu dispositivo.'
        });
      }
    } catch (err) {
      console.error('Error al geolocalizar:', err);
      setGeoFeedback({
        type: 'error',
        text: 'Hubo un problema de conexión al buscar las coordenadas. Intenta de nuevo o ingresalas manualmente.'
      });
    } finally {
      setGeoLoading(false);
    }
  };

  // Capture device's current GPS position
  const handleUseDeviceGps = () => {
    if (!navigator.geolocation) {
      setGeoFeedback({ type: 'error', text: 'Tu navegador no soporta geolocalización GPS.' });
      return;
    }

    setGeoLoading(true);
    setGeoFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = parseFloat(position.coords.latitude.toFixed(6));
        const newLng = parseFloat(position.coords.longitude.toFixed(6));

        setFormData((prev) => ({
          ...prev,
          coordinates: {
            lat: newLat,
            lng: newLng
          },
          googleMapsUrl: `https://maps.google.com/?q=${newLat},${newLng}`,
          wazeUrl: `https://waze.com/ul?ll=${newLat},${newLng}&navigate=yes`
        }));

        setGeoFeedback({
          type: 'success',
          text: `¡Ubicación GPS capturada con éxito desde tu dispositivo! (${newLat}, ${newLng})`
        });
        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoFeedback({
          type: 'error',
          text: 'No pudimos acceder a tu GPS. Verifica los permisos de ubicación de tu navegador.'
        });
        setGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualCoordChange = (field: 'lat' | 'lng', value: number) => {
    const updatedCoords = {
      ...formData.coordinates,
      [field]: value
    };

    setFormData({
      ...formData,
      coordinates: updatedCoords,
      googleMapsUrl: `https://maps.google.com/?q=${updatedCoords.lat},${updatedCoords.lng}`,
      wazeUrl: `https://waze.com/ul?ll=${updatedCoords.lat},${updatedCoords.lng}&navigate=yes`
    });
  };

  const mapsVerificationUrl = `https://www.google.com/maps/search/?api=1&query=${formData.coordinates?.lat || 0},${formData.coordinates?.lng || 0}`;

  return (
    <div className="space-y-6">
      {/* CARD 4: CONTACTO, WHATSAPP & SEGURIDAD */}
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

      {/* CARD 5: DIRECCIÓN & COORDENADAS GPS */}
      <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> 5. Dirección Física & Coordenadas GPS del Negocio
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold self-start sm:self-auto">
            Sincronización GPS en Vivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">Calle y Altura *</label>
            <input
              type="text"
              required
              id="input-shop-address"
              placeholder="Ej: Evita 1131"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Barrio / Zona</label>
            <input
              type="text"
              placeholder="Ej: El Jagüel"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ciudad / Provincia</label>
            <input
              type="text"
              placeholder="Ej: Buenos Aires"
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
              id="input-shop-lat"
              value={formData.coordinates?.lat ?? 0}
              onChange={(e) => handleManualCoordChange('lat', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 text-amber-400 px-3 py-2 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Longitud GPS</label>
            <input
              type="number"
              step="any"
              id="input-shop-lng"
              value={formData.coordinates?.lng ?? 0}
              onChange={(e) => handleManualCoordChange('lng', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 text-amber-400 px-3 py-2 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action buttons for GPS automation & verification */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleAutoGeocode}
            disabled={geoLoading}
            className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Buscar automáticamente las coordenadas en el mapa a partir de la dirección escrita"
          >
            <Search className={`w-3.5 h-3.5 text-blue-400 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Buscando satélite...' : '🔍 Buscar Coordenadas de la Dirección'}</span>
          </button>

          <button
            type="button"
            onClick={handleUseDeviceGps}
            disabled={geoLoading}
            className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Detectar y usar la ubicación GPS exacta de este dispositivo (si estás en el local)"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>🎯 Usar Mi Ubicación Actual</span>
          </button>

          <a
            href={mapsVerificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ml-auto"
            title="Abrir en Google Maps para verificar que el punto caiga en el lugar correcto"
          >
            <span>Verificar en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>

        {/* Feedback message banner */}
        {geoFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
              geoFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {geoFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{geoFeedback.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
