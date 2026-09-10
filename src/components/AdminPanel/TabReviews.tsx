import React from 'react';
import { useBarber } from '../../context/BarberContext';
import { Star, CheckCircle, Trash2, Eye, Award } from 'lucide-react';

export const TabReviews: React.FC = () => {
  const { reviews, toggleHighlightReview, toggleVerifyReview, deleteReview } = useBarber();

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h3 className="text-base font-bold text-white font-['Syne']">
          Gestión Exclusiva de Reseñas y Testimonios
        </h3>
        <p className="text-slate-400">
          Modera las opiniones de los clientes. Puedes verificar compras reales, destacarlas en la portada o remover contenido no deseado.
        </p>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-900 rounded-xl">
            Aún no hay reseñas registradas.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-4 rounded-xl bg-slate-900 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                rev.highlighted ? 'border-amber-500/50 bg-slate-900/90' : 'border-slate-800'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <strong className="text-white text-sm">{rev.clientName}</strong>
                  {rev.verified && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3 h-3" /> Verificado
                    </span>
                  )}
                  {rev.highlighted && (
                    <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 font-bold">
                      <Award className="w-3 h-3" /> Destacado en Inicio
                    </span>
                  )}
                </div>

                <p className="text-slate-300 italic text-xs">"{rev.comment}"</p>

                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Barbero: <strong className="text-slate-200">{rev.barberName}</strong></span>
                  <span>• Servicio: <strong className="text-slate-200">{rev.serviceName}</strong></span>
                  <span>• {rev.date}</span>
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleHighlightReview(rev.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    rev.highlighted
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Mostrar en primera posición de la web"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{rev.highlighted ? 'Destacado' : 'Destacar'}</span>
                </button>

                <button
                  onClick={() => toggleVerifyReview(rev.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    rev.verified
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                  title="Cambiar estado de verificación"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{rev.verified ? 'Verificado' : 'Sin verificar'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('¿Eliminar esta reseña?')) {
                      deleteReview(rev.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 transition cursor-pointer"
                  title="Eliminar reseña"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
