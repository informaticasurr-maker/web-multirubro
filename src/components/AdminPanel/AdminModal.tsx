import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import {
  X,
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
  UserCheck
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
import { AdminLoginScreen } from './AdminLoginScreen';
import { AdminPasswordSetupModal } from './AdminPasswordSetupModal';

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
  const {
    isAdmin,
    currentUser,
    logoutAdmin,
    appointments,
    config,
    checkUserPasswordStatus,
    isCloudSynced,
    lastCloudSyncTime
  } = useBarber();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [forceShowPasswordChange, setForceShowPasswordChange] = useState(false);

  if (!isOpen) return null;

  const activeEmail = currentUser?.email || 'informaticasurr@gmail.com';
  const passwordStatus = checkUserPasswordStatus(activeEmail);
  const mustChangePassword = !passwordStatus.isPasswordChanged;

  const pendingCount = appointments.filter((a) => a.status === 'pendiente').length;

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
        <div className="px-5 sm:px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-['Syne'] truncate">
                  Panel de Control Barbería
                </h2>
                <span className="hidden sm:inline-block text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold truncate max-w-[150px]">
                  {config.shopName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                {currentUser ? (
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentUser.displayName || currentUser.email}</span>
                    <span className="text-[10px] text-emerald-400 font-mono hidden md:inline">({currentUser.email})</span>
                  </span>
                ) : (
                  <span>
                    Administrador: <strong className="text-slate-200">{config.adminName}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isCloudSynced && (
              <span
                className="hidden sm:flex items-center gap-1.5 text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-xl font-medium"
                title={lastCloudSyncTime ? `Última sincronización con la nube: ${lastCloudSyncTime}` : 'Sincronizado en tiempo real con Firebase'}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>En la Nube</span>
              </span>
            )}
            {isAdmin && !mustChangePassword && (
              <button
                onClick={() => setForceShowPasswordChange(true)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700/60"
                title="Cambiar Contraseña de Administrador"
              >
                <span className="hidden sm:inline">Cambiar Clave</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={logoutAdmin}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-400" />
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
          <AdminLoginScreen />
        ) : mustChangePassword || forceShowPasswordChange ? (
          <AdminPasswordSetupModal
            email={activeEmail}
            onCompleted={() => setForceShowPasswordChange(false)}
          />
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
