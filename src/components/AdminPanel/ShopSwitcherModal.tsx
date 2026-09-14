import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import {
  Store,
  Plus,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  X,
  Sparkles,
  Building,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { getShopShareUrl, slugify, DEFAULT_SHOP_SLUG } from '../../utils/shopRouter';

interface ShopSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopSwitcherModal: React.FC<ShopSwitcherModalProps> = ({ isOpen, onClose }) => {
  const {
    currentShopSlug,
    availableShops,
    switchShop,
    createNewShop,
    deleteShop,
    currentUser,
    isSuperAdmin,
    triggerPushNotification
  } = useBarber();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New shop form state
  const [newShopName, setNewShopName] = useState('');
  const [newShopSlug, setNewShopSlug] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopSlogan, setNewShopSlogan] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewShopName(val);
    setNewShopSlug(slugify(val));
    setFormError(null);
  };

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShopShareUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    triggerPushNotification('Enlace Copiado 📋', `El enlace público para ${slug} fue copiado al portapapeles.`);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleSelectShop = (slug: string) => {
    switchShop(slug);
    onClose();
  };

  const handleDeleteShop = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente la barbería "${slug}"?`)) {
      const res = await deleteShop(slug);
      if (!res.success && res.error) {
        alert(res.error);
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) {
      setFormError('Por favor ingresa el nombre de la nueva barbería.');
      return;
    }

    const cleanSlug = slugify(newShopSlug || newShopName);
    if (!cleanSlug) {
      setFormError('Ingresa un identificador o enlace válido.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await createNewShop({
        name: newShopName.trim(),
        slug: cleanSlug,
        phone: newShopPhone.trim() || undefined,
        slogan: newShopSlogan.trim() || undefined,
        address: newShopAddress.trim() || undefined,
        ownerEmail: currentUser?.email || undefined
      });

      if (result.success) {
        setNewShopName('');
        setNewShopSlug('');
        setNewShopPhone('');
        setNewShopSlogan('');
        setNewShopAddress('');
        setActiveTab('list');
        onClose();
      } else {
        setFormError(result.error || 'Error al crear la barbería.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Error inesperado al crear la barbería.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Syne']">
                Gestor Multi-Negocio / Barberías
              </h3>
              <p className="text-xs text-slate-400">
                Administra múltiples barberías independientes o crea un nuevo negocio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-5 sm:px-6 pt-3 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-4 font-semibold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Barberías Registradas ({availableShops.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-3 px-4 font-semibold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Nueva Barbería</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'list' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Selecciona una barbería para administrarla o comparte su enlace:</span>
                {isSuperAdmin && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    Acceso SuperAdmin
                  </span>
                )}
              </div>

              <div className="grid gap-2.5">
                {availableShops.map((shop) => {
                  const isActive = (currentShopSlug || DEFAULT_SHOP_SLUG) === shop.slug;
                  const isCopied = copiedSlug === shop.slug;
                  const shareUrl = getShopShareUrl(shop.slug);

                  return (
                    <div
                      key={shop.slug}
                      onClick={() => handleSelectShop(shop.slug)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {shop.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">
                              {shop.name}
                            </h4>
                            {isActive && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Activa
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono truncate">
                            <span>/{shop.slug}</span>
                            {shop.phone && <span>• {shop.phone}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(shop.slug, e)}
                          title="Copiar enlace público para clientes"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700/60"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{isCopied ? 'Copiado' : 'Copiar Link'}</span>
                        </button>

                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Ver web pública del negocio"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer border border-slate-700/60"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {shop.slug !== DEFAULT_SHOP_SLUG && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteShop(shop.slug, e)}
                            title="Eliminar este negocio"
                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.99] cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nueva Barbería para otro Barbero / Cliente</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Crea una nueva barbería con su propia base de datos aislada. Se generará con una plantilla inicial que el barbero podrá personalizar totalmente.
                </p>
              </div>

              {formError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Nombre Comercial de la Barbería *</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Vikingos Barbershop"
                    value={newShopName}
                    onChange={handleNameChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Identificador / Enlace Web (Slug) *</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="ej. vikingos-barber"
                    value={newShopSlug}
                    onChange={(e) => setNewShopSlug(slugify(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Enlace público final: <strong className="text-amber-400">{getShopShareUrl(newShopSlug || 'mi-barberia')}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">WhatsApp / Teléfono</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+54 9 11 2345-6789"
                      value={newShopPhone}
                      onChange={(e) => setNewShopPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Eslogan del Local</label>
                  <input
                    type="text"
                    placeholder="Ej. Estilo y precisión en cada corte"
                    value={newShopSlogan}
                    onChange={(e) => setNewShopSlogan(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Dirección Física</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ej. Av. Principal 1234, Centro"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creando...' : 'Crear y Abrir Barbería'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
