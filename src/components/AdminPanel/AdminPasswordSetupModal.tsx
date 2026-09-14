import React, { useState } from 'react';
import { useBarber } from '../../context/BarberContext';
import {
  Lock,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPasswordSetupModalProps {
  email: string;
  onCompleted?: () => void;
}

export const AdminPasswordSetupModal: React.FC<AdminPasswordSetupModalProps> = ({
  email,
  onCompleted
}) => {
  const { currentUser, updateAdminUserPassword } = useBarber();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeEmail = email || currentUser?.email || 'informaticasurr@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPass = newPassword.trim();
    if (cleanPass.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (cleanPass === '131882' || cleanPass === '1234') {
      setErrorMessage('Debes elegir una contraseña distinta a la clave por defecto (131882).');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateAdminUserPassword(activeEmail, cleanPass);
      if (!res.success) {
        setErrorMessage(res.error || 'No fue posible guardar la contraseña.');
      } else {
        setIsSuccess(true);
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // Ignore confetti error if any
        }
        setTimeout(() => {
          if (onCompleted) onCompleted();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al guardar la contraseña en Firebase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow ambient background decoration */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        {isSuccess ? (
          <div className="py-8 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-white font-['Syne']">
              ¡Contraseña Personal Guardada!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tu clave ha sido asociada correctamente a tu cuenta de Google{' '}
              <strong className="text-amber-300 font-mono">{activeEmail}</strong> y guardada en Firebase.
            </p>
            <div className="pt-2">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-[11px] text-slate-400 mt-2 block">Ingresando al panel...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header Icon */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Lock className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mt-3 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Primer Ingreso Obligatorio
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white font-['Syne']">
                Configura tu Contraseña de Administrador
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Para proteger el acceso a la administración asociado a{' '}
                <span className="text-amber-300 font-mono font-bold">{activeEmail}</span>, debes
                reemplazar la clave inicial por defecto (<code className="text-amber-400">131882</code>) por tu propia contraseña personal.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-left flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nueva Contraseña / PIN Personal:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Mínimo 4 caracteres (ej: tu clave secreta)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-4 pr-10 py-3 rounded-xl text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirma tu Nueva Contraseña:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Guardando en Firebase...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Guardar y Asociar a mi cuenta de Google</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            <p className="text-[10px] text-slate-500 italic">
              * Esta clave se guardará en tu cuenta de Firebase y la podrás usar para gestionar la barbería.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
