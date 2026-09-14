import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import {
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Lock,
  Sparkles,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

interface AdminLoginScreenProps {
  onSuccess?: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onSuccess }) => {
  const {
    loginWithGoogle,
    verifyPin,
    config,
    currentUser,
    updateAdminUserPassword,
    checkUserPasswordStatus
  } = useBarber();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showEmailsInfo, setShowEmailsInfo] = useState(false);

  // First-time password change wizard state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>('informaticasur@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const allowedEmails = config.allowedAdminEmails || [
    'informaticasurr@gmail.com',
    'informaticasur@gmail.com'
  ];

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(res.error || 'No fue posible iniciar sesión con Google.');
      } else {
        // Check if user must change password
        const activeEmail = currentUser?.email || 'informaticasurr@gmail.com';
        const status = checkUserPasswordStatus(activeEmail);
        if (!status.isPasswordChanged) {
          setPendingEmail(activeEmail);
          setMustChangePassword(true);
        } else {
          if (onSuccess) onSuccess();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocurrió un error inesperado al conectar con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = verifyPin(pinInput);
    if (!ok) {
      setPinError(true);
      setPinInput('');
    } else {
      setPinError(false);
      // Check if entered pin was default 131882 and password hasn't been changed yet
      const status = checkUserPasswordStatus(currentUser?.email || 'informaticasur@gmail.com');
      if (pinInput.trim() === '131882' || !status.isPasswordChanged) {
        setPendingEmail(currentUser?.email || 'informaticasur@gmail.com');
        setMustChangePassword(true);
      } else {
        setPinInput('');
        if (onSuccess) onSuccess();
      }
    }
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);

    if (newPassword.length < 4) {
      setPasswordChangeError('La contraseña debe contener al menos 4 caracteres.');
      return;
    }

    if (newPassword === '131882' || newPassword === '1234') {
      setPasswordChangeError('Debes elegir una contraseña diferente a la clave por defecto.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Las contraseñas no coinciden. Verifícalas e inténtalo nuevamente.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await updateAdminUserPassword(pendingEmail, newPassword);
      if (!res.success) {
        setPasswordChangeError(res.error || 'Error al guardar la contraseña.');
      } else {
        setMustChangePassword(false);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setPasswordChangeError(err?.message || 'Error inesperado al guardar contraseña.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 1. Mandatory First-time Password Change Screen
  if (mustChangePassword) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-md w-full bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Primer Ingreso de Administrador
            </div>
            <h3 className="text-xl font-black text-white font-['Syne']">
              Configura tu Contraseña Personal
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Para proteger el panel de administración asociado a tu cuenta de Gmail (
              <span className="text-amber-300 font-mono font-bold">{pendingEmail}</span>),
              reemplaza la clave inicial (<code className="text-amber-400">131882</code>) por tu propia contraseña.
            </p>
          </div>

          {passwordChangeError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-left flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{passwordChangeError}</span>
            </div>
          )}

          <form onSubmit={handleSaveNewPassword} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nueva Contraseña / PIN Personal:
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-4 pr-10 py-3 rounded-xl text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirma tu Nueva Contraseña:
              </label>
              <input
                type="password"
                required
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingPassword ? (
                <span>Guardando en Firebase...</span>
              ) : (
                <>
                  <span>Guardar y Asociar a Gmail</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 italic">
            * Esta contraseña se asociará de forma permanente a tu correo de Google y servirá para tus futuros accesos.
          </p>
        </div>
      </div>
    );
  }

  // 2. Standard Login Screen (Google Sign-In + Fallback PIN)
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow ambient background decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner shadow-amber-500/20 text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold mt-3 font-mono">
            <Sparkles className="w-3 h-3" />
            <span>Acceso Privado /admin</span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black text-white font-['Syne'] tracking-tight">
            Panel Administrativo
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Ingresa con tu cuenta de Google autorizada en Firebase para gestionar citas, caja y barberos de <span className="text-slate-200 font-semibold">{config.shopName}</span>.
          </p>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-left flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-red-400">Acceso No Permitido</h4>
              <p className="text-[11px] text-red-300/90 leading-normal">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main Google Login Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-bold rounded-2xl text-sm transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 border border-slate-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                <span className="text-xs font-semibold">Conectando con Google...</span>
              </div>
            ) : (
              <>
                {/* Official Google 'G' SVG */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-semibold text-slate-800 group-hover:text-slate-950">
                  Iniciar sesión con Google
                </span>
              </>
            )}
          </button>

          {/* Whitelisted emails preview toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowEmailsInfo(!showEmailsInfo)}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 mx-auto transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver correos con acceso autorizado</span>
              {showEmailsInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showEmailsInfo && (
              <div className="mt-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-left space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-800/80 pb-1.5">
                  <span>Correos autorizados en Firebase:</span>
                  <span className="text-amber-400 font-mono">{allowedEmails.length}</span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {allowedEmails.map((email, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/50"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="truncate">{email}</span>
                      {email.toLowerCase() === 'informaticasur@gmail.com' && (
                        <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-sans font-bold">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
              O ingresar con clave de acceso
            </span>
          </div>
        </div>

        {/* Alternative PIN / Password login */}
        <div>
          {!showPinFallback ? (
            <button
              onClick={() => setShowPinFallback(true)}
              className="w-full py-2.5 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/50"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Ingresar con Contraseña</span>
            </button>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-3 animate-in fade-in duration-200">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoFocus
                  placeholder="Ingresa clave (por defecto: 131882)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-center text-white pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              {pinError && (
                <p className="text-xs text-red-400 font-semibold animate-shake">
                  Clave incorrecta. Intenta con la clave configurada o con tu cuenta de Google.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinFallback(false)}
                  className="w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Ingresar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
