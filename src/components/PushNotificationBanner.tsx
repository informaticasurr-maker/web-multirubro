import React from 'react';
import { useBarber } from '../context/BarberContext';
import { Bell, X, Sparkles, Calendar, Tag } from 'lucide-react';

export const PushNotificationBanner: React.FC = () => {
  const { activeNotification, dismissNotification } = useBarber();

  if (!activeNotification) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-short">
      <div className="bg-slate-900/95 border border-amber-500/40 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <h4 className="font-bold text-white text-xs">{activeNotification.title}</h4>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            {activeNotification.message}
          </p>
          <span className="text-[9px] text-slate-500 mt-1 block">Notificación push inmediata</span>
        </div>

        <button
          onClick={dismissNotification}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
