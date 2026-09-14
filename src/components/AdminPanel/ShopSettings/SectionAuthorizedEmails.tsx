import React, { useState } from 'react';
import { useBarber } from '../../../context/BarberContext';
import { BarberShopConfig } from '../../../types';
import {
  ShieldCheck,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  KeyRound,
  Database
} from 'lucide-react';

interface SectionAuthorizedEmailsProps {
  formData: BarberShopConfig;
  setFormData: React.Dispatch<React.SetStateAction<BarberShopConfig>>;
}

export const SectionAuthorizedEmails: React.FC<SectionAuthorizedEmailsProps> = ({
  formData,
  setFormData
}) => {
  const { currentUser } = useBarber();
  const [newEmailInput, setNewEmailInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);

  const allowedEmails = formData.allowedAdminEmails || [
    'informaticasurr@gmail.com',
    'informaticasur@gmail.com',
    'eliascjnegocios@gmail.com'
  ];

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setInputError('Ingresa una dirección de correo válida.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setInputError('El formato de correo no es válido (ejemplo: nombre@gmail.com).');
      return;
    }

    if (allowedEmails.some((e) => e.toLowerCase() === cleanEmail)) {
      setInputError('Este correo ya se encuentra en la lista de autorizados.');
      return;
    }

    const updated = [...allowedEmails, cleanEmail];
    setFormData((prev) => ({
      ...prev,
      allowedAdminEmails: updated
    }));

    setNewEmailInput('');
    setInputError(null);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const cleanToRemove = emailToRemove.toLowerCase();
    const updated = allowedEmails.filter((e) => e.toLowerCase() !== cleanToRemove);
    setFormData((prev) => ({
      ...prev,
      allowedAdminEmails:
        updated.length > 0
          ? updated
          : ['informaticasurr@gmail.com', 'informaticasur@gmail.com']
    }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-['Syne']">
                Seguridad & Correos Autorizados (Firebase Google Auth)
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                {allowedEmails.length} autorizados
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Solo las cuentas de Google listadas aquí podrán iniciar sesión en el panel administrativo.
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-5 h-5 rounded-full border border-amber-500/50 object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">
                {currentUser.displayName?.charAt(0) || 'A'}
              </div>
            )}
            <span className="text-slate-300 font-medium truncate max-w-[150px]">
              {currentUser.email}
            </span>
          </div>
        )}
      </div>

      {/* Add New Email Form */}
      <form onSubmit={handleAddEmail} className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Agregar nuevo correo con acceso de administrador:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="ejemplo: informaticasur@gmail.com o barbero@gmail.com"
              value={newEmailInput}
              onChange={(e) => {
                setNewEmailInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-600 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Autorizar Correo</span>
          </button>
        </div>
        {inputError && <p className="text-xs text-red-400 font-medium">{inputError}</p>}
      </form>

      {/* Allowed Emails List */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Lista blanca activa de administradores:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {allowedEmails.map((email, index) => {
            const isMaster = email.toLowerCase() === 'informaticasur@gmail.com';
            const isCurrent = currentUser?.email?.toLowerCase() === email.toLowerCase();

            return (
              <div
                key={index}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition ${
                  isMaster
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isMaster ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-medium truncate">{email}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isMaster && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded">
                          Usuario Principal
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Sesión Actual
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isMaster && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer flex-shrink-0"
                    title="Revocar acceso a este correo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Firebase Config Accordion (Optional) */}
      <div className="pt-2 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => setShowFirebaseConfig(!showFirebaseConfig)}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{showFirebaseConfig ? 'Ocultar' : 'Configurar'} Credenciales personalizadas de Firebase Project (Opcional)</span>
        </button>

        {showFirebaseConfig && (
          <div className="mt-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Si deseas conectar tu propio proyecto de Firebase para producción, puedes ingresar las claves aquí o mediante el archivo <code className="text-amber-400">.env</code>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">API Key (VITE_FIREBASE_API_KEY)</label>
                <input
                  type="text"
                  value={formData.firebaseConfig?.apiKey || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firebaseConfig: { ...prev.firebaseConfig, apiKey: e.target.value }
                    }))
                  }
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Auth Domain (VITE_FIREBASE_AUTH_DOMAIN)</label>
                <input
                  type="text"
                  value={formData.firebaseConfig?.authDomain || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firebaseConfig: { ...prev.firebaseConfig, authDomain: e.target.value }
                    }))
                  }
                  placeholder="tu-proyecto.firebaseapp.com"
                  className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Project ID (VITE_FIREBASE_PROJECT_ID)</label>
                <input
                  type="text"
                  value={formData.firebaseConfig?.projectId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firebaseConfig: { ...prev.firebaseConfig, projectId: e.target.value }
                    }))
                  }
                  placeholder="tu-proyecto-id"
                  className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">App ID (VITE_FIREBASE_APP_ID)</label>
                <input
                  type="text"
                  value={formData.firebaseConfig?.appId || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firebaseConfig: { ...prev.firebaseConfig, appId: e.target.value }
                    }))
                  }
                  placeholder="1:123456789012:web:abcdef..."
                  className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
