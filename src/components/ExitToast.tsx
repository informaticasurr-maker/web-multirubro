import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

interface ExitToastProps {
  show: boolean;
}

export const ExitToast: React.FC<ExitToastProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div
      id="app-exit-toast"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div className="bg-slate-900/95 text-slate-100 px-4 py-2.5 rounded-full border border-amber-500/40 shadow-2xl shadow-black/90 backdrop-blur-xl flex items-center gap-2.5 text-xs font-semibold">
        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
        <span>Presiona atrás de nuevo para salir al escritorio</span>
      </div>
    </div>
  );
};
