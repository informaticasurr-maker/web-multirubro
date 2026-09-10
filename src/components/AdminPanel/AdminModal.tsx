import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import {
  X,
  Lock,
  Calendar,
  DollarSign,
  Users,
  Scissors,
  Camera,
  Image as ImageIcon,
  Star,
  Settings,
  Cloud,
  LogOut,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { TabAppointments } from './TabAppointments';
import { TabFinancials } from './TabFinancials';
import { TabBarbers } from './TabBarbers';
import { TabServices } from './TabServices';
import { TabStories } from './TabStories';
import { TabGallery } from './TabGallery';
import { TabReviews } from './TabReviews';
import { TabShopSettings } from './TabShopSettings';
import { TabDriveAndSeo } from './TabDriveAndSeo';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'appointments'
}) => {
  const { isAdmin, verifyPin, logoutAdmin, appointments, config } = useBarber();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const pendingCount = appointments.filter((a) => a.status === 'pendiente').length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = verifyPin(pinInput);
    if (!ok) {
      setPinError(true);
      setPinInput('');
    } else {
      setPinError(false);
      setPinInput('');
    }
  };

  const tabs = [
    {
      id: 'appointments',
      label: 'Citas y Turnos',
      icon: Calendar,
      badge: pendingCount > 0 ? pendingCount : null
    },
    { id: 'financials', label: 'Caja e Ingresos', icon: DollarSign },
    { id: 'barbers', label: 'Barberos & Horarios', icon: Users },
    { id: 'services', label: 'Servicios & Tarifas', icon: Scissors },
    { id: 'stories', label: 'Historias / Estados', icon: Camera },
    { id: 'gallery', label: 'Galería de Cortes', icon: ImageIcon },
    { id: 'reviews', label: 'Gestión de Reseñas', icon: Star },
    { id: 'shop', label: 'Identidad, Textos & Local', icon: Settings },
    { id: 'drive', label: 'Google Drive & SEO', icon: Cloud }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] max-h-[900px] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-['Syne']">
                  Panel de Control Barbería
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  {config.shopName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administrador: <strong className="text-slate-200">{config.adminName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={logoutAdmin}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isAdmin ? (
          /* PIN Login Screen */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-sm w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center space-y-5 shadow-xl">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-['Syne']">Acceso Administrador</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa tu PIN de seguridad para gestionar citas, ingresos y configuración del local.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={8}
                    autoFocus
                    placeholder="PIN (por defecto: 1234)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-center text-white pl-9 pr-3 py-3 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-amber-500"
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-red-400 font-semibold animate-shake">
                    PIN incorrecto. Intenta con "1234".
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Ingresar al Panel
                </button>
              </form>

              <div className="text-[11px] text-slate-500">
                <span>PIN por defecto configurado: </span>
                <code className="text-amber-400 font-mono font-bold">1234</code>
                <p className="mt-0.5">(Puedes cambiarlo dentro de la pestaña "Datos del Local")</p>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard with Tabs */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar / Tabs Navigation */}
            <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 md:p-3 gap-1 scrollbar-none flex-shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-950/60 scrollbar-thin">
              {activeTab === 'appointments' && <TabAppointments />}
              {activeTab === 'financials' && <TabFinancials />}
              {activeTab === 'barbers' && <TabBarbers />}
              {activeTab === 'services' && <TabServices />}
              {activeTab === 'stories' && <TabStories />}
              {activeTab === 'gallery' && <TabGallery />}
              {activeTab === 'reviews' && <TabReviews />}
              {activeTab === 'shop' && <TabShopSettings />}
              {activeTab === 'drive' && <TabDriveAndSeo />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
