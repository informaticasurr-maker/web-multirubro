import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Car,
  Footprints,
  Phone,
  Search,
  CheckCircle2,
  Compass,
  Building2
} from 'lucide-react';

export const GpsLocationSection: React.FC = () => {
  const { config } = useBarber();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculateDistance = () => {
    if (!navigator.geolocation) {
      setErrorMsg('La geolocalización no está soportada por tu navegador.');
      return;
    }

    setCalculating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setUserCoords({ lat: uLat, lng: uLng });

        const sLat = config.coordinates.lat;
        const sLng = config.coordinates.lng;

        // Haversine formula
        const R = 6371; // km
        const dLat = ((sLat - uLat) * Math.PI) / 180;
        const dLon = ((sLng - uLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((uLat * Math.PI) / 180) *
          Math.cos((sLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        setDistanceKm(parseFloat(d.toFixed(1)));
        setCalculating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setErrorMsg('No pudimos acceder a tu GPS. Verifica los permisos de ubicación de tu navegador.');
        setCalculating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Build exact location query for Google Maps embed and navigation using exact coordinates
  let lat = config.coordinates?.lat ?? -34.8328;
  let lng = config.coordinates?.lng ?? -58.4957;

  // Intercept any legacy Obelisco / Microcentro coordinates (-34.6037, -58.3816) and direct to Evita 1131, El Jagüel (-34.8328, -58.4957)
  if (
    lat > -34.70 || // Obelisco / CABA is around -34.6037 (greater than -34.70)
    (Math.abs(lat - -34.6037) < 0.08 && Math.abs(lng - -58.3816) < 0.08) ||
    lat === 0 ||
    !lat
  ) {
    lat = -34.8328;
    lng = -58.4957;
  }

  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=17&t=&ie=UTF8&iwloc=&output=embed`;

  // Google Maps navigation link
  const googleMapsRouteUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${lat},${lng}&travelmode=driving`
    : `https://www.google.com/maps?q=${lat},${lng}`;

  const wazeRouteUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  return (
    <section id="ubicacion" className="py-6 sm:py-12 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
            <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Ubicación GPS & Cómo Llegar
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white font-['Syne'] tracking-tight">
            Encuéntranos en el Corazón de la Ciudad
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
            Optimizada para geolocalización y primeras posiciones en Google Maps según tu ubicación actual.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
          {/* Info Card & GPS Distance Engine */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="p-3.5 sm:p-6 bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-800">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-white font-['Syne']">
                    {config.shopName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5 sm:mt-1">
                    {config.address}, {config.neighborhood}
                  </p>
                </div>
              </div>

              {/* GPS Live Locator Button */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800">
                <button
                  id="gps-calculate-distance-btn"
                  onClick={calculateDistance}
                  disabled={calculating}
                  className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer"
                >
                  <Navigation className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 ${calculating ? 'animate-spin' : ''}`} />
                  <span>
                    {calculating
                      ? 'Consultando satélite GPS...'
                      : distanceKm !== null
                        ? 'Recalcular mi distancia'
                        : '¿A qué distancia estás? Calcular GPS'}
                  </span>
                </button>

                {errorMsg && (
                  <p className="text-[11px] text-red-400 mt-2 text-center">{errorMsg}</p>
                )}

                {/* Live Distance Result Card */}
                {distanceKm !== null && (
                  <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-slate-200 animate-fade-in">
                    <div className="flex items-center justify-between font-bold text-amber-300 mb-2">
                      <span>Estás a sólo:</span>
                      <span className="text-lg font-black font-['Syne']">{distanceKm} km</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Footprints className="w-3.5 h-3.5 text-amber-400" />
                        A pie: ~{Math.round(distanceKm * 12)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        En auto: ~{Math.max(2, Math.round(distanceKm * 3))} min
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Direct Buttons */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <a
                  id="open-google-maps-btn"
                  href={googleMapsRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  title="Abrir Ruta en Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>

                <a
                  id="open-waze-btn"
                  href={wazeRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  title="Abrir Ruta en Waze"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Waze</span>
                </a>

                <a
                  id="open-google-business-btn"
                  href={
                    config.googleBusinessUrl &&
                      config.googleBusinessUrl !== 'https://business.google.com' &&
                      config.googleBusinessUrl.trim() !== ''
                      ? config.googleBusinessUrl
                      : googleMapsRouteUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border border-amber-800/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  title="Ver Perfil y Reseñas en Google Negocios"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Negocios</span>
                </a>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> {config.adminPhone}
                </span>
                <a
                  href={`tel:${config.adminPhone.replace(/[^0-9+]/g, '')}`}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Llamar directo
                </a>
              </div>
            </div>

            {/* Google Business & Local SEO Feature Banner */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-white font-bold mb-1">
                <Search className="w-4 h-4 text-amber-400" />
                <span>Posicionamiento Local Google & SEO</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Esta web incluye datos estructurados <strong>Schema.org (BarberShop)</strong> con coordenadas exactas ({config.coordinates.lat}, {config.coordinates.lng}), catálogo de turnos y puntuación para figurar primera en búsquedas locales y Google Maps.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Google My Business sincronizado
              </div>
            </div>
          </div>

          {/* Interactive Visual Map Card */}
          <div className="lg:col-span-7 h-full min-h-[380px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl flex flex-col">
            {/* Google Maps Real Location Embed */}
            <iframe
              title="Mapa de la Barbería"
              width="100%"
              height="100%"
              className="w-full h-full min-h-[380px] border-0 rounded-2xl"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
            />

            {/* Overlay Pin Banner */}
            <div className="absolute top-4 left-4 right-4 sm:right-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl max-w-sm pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <strong className="text-xs text-white font-bold">{config.shopName}</strong>
              </div>
              <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                {config.openingHoursText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
