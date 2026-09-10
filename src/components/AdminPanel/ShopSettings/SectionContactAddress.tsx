import React from 'react';
import { BarberShopConfig } from '../../../types';
import { Phone, MapPin } from 'lucide-react';

interface SectionContactAddressProps {
  formData: BarberShopConfig;
  setFormData: React.Dispatch<React.SetStateAction<BarberShopConfig>>;
}

export const SectionContactAddress: React.FC<SectionContactAddressProps> = ({
  formData,
  setFormData
}) => {
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
    </div>
  );
};
