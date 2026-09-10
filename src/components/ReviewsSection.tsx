import React, { useState } from 'react';
import { useBarber } from '../context/BarberContext';
import { Star, CheckCircle, MessageSquarePlus, ShieldCheck, ThumbsUp } from 'lucide-react';
import { ReviewItem } from '../types';

interface ReviewsSectionProps {
  onOpenAdminReviews?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onOpenAdminReviews }) => {
  const { reviews, barbers, services, addReview, isAdmin } = useBarber();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(barbers[0]?.name || '');
  const [selectedService, setSelectedService] = useState(services[0]?.name || '');

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fiveStarPercent = reviews.length > 0 ? Math.round((fiveStarCount / reviews.length) * 100) : 100;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim()) {
      alert('Por favor completa tu nombre y tu comentario.');
      return;
    }

    const lastDigits = clientPhone.replace(/[^0-9]/g, '').slice(-4);

    addReview({
      clientName: clientName.trim(),
      clientPhoneLastDigits: lastDigits || undefined,
      rating,
      comment: comment.trim(),
      barberName: selectedBarber,
      serviceName: selectedService,
      verified: true
    });

    setIsModalOpen(false);
    setComment('');
    setClientName('');
  };

  return (
    <section id="resenas" className="py-6 sm:py-12 bg-slate-900/40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Header & Overall Metric */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-8 gap-3 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Testimonios Reales Verificados
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white font-['Syne'] tracking-tight">
              Opiniones de Nuestros Clientes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
              Reputación intachable respaldada por cortes de precisión y atención de primer nivel.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="open-review-form-btn"
              onClick={() => setIsModalOpen(true)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] sm:text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 sm:gap-2 transition cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Dejar Mi Reseña</span>
            </button>

            {isAdmin && onOpenAdminReviews && (
              <button
                onClick={onOpenAdminReviews}
                className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] sm:text-xs rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Gestionar
              </button>
            )}
          </div>
        </div>

        {/* Rating summary banner */}
        <div className="p-3.5 sm:p-6 bg-slate-950 rounded-xl sm:rounded-2xl border border-slate-800 mb-4 sm:mb-8 flex flex-col sm:flex-row items-center justify-around gap-3 sm:gap-6">
          <div className="text-center sm:text-left flex items-center gap-3 sm:gap-4">
            <span className="text-3xl sm:text-5xl font-black text-amber-400 font-['Syne']">
              {averageRating}
            </span>
            <div>
              <div className="flex items-center gap-0.5 sm:gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                Basado en {reviews.length} testimonios verificados
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>5 Estrellas</span>
              <div className="w-24 sm:w-32 bg-slate-800 h-1.5 sm:h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: `${fiveStarPercent}%` }} />
              </div>
              <span className="font-bold text-slate-200">{fiveStarPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Puntualidad de turnos</span>
              <span className="font-semibold text-emerald-400">99.4%</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-white">Google Negocios Conectado</strong>
              <span className="text-slate-400">Sincronizado con perfil de Google Maps</span>
            </div>
          </div>
        </div>

        {/* Reviews Cards: 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950 border flex flex-col justify-between transition-all ${
                rev.highlighted
                  ? 'border-amber-500/40 shadow-md sm:shadow-lg shadow-amber-500/5'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-2 sm:mb-3">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400" />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="flex items-center gap-0.5 text-[8px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-800/50">
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Verificado
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-sm text-slate-300 italic mb-3 line-clamp-3 sm:line-clamp-none">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-2 sm:pt-3 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-xs">
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate text-[11px] sm:text-sm">
                    {rev.clientName}
                    {rev.clientPhoneLastDigits && (
                      <span className="text-slate-500 text-[9px] sm:text-[10px] ml-1 font-mono">
                        (..{rev.clientPhoneLastDigits})
                      </span>
                    )}
                  </h4>
                  <p className="text-[9px] sm:text-[11px] text-amber-400 font-medium truncate">
                    Por {rev.barberName}
                  </p>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-500">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Dejar Reseña */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white font-['Syne'] mb-1">
                Califica tu Experiencia
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Tu opinión nos ayuda a mantener el más alto estándar de barbería.
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Puntuación:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            num <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      {rating} de 5 Estrellas
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Gómez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono (Para verificar tu turno):
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 11 4455 6677"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Barbero que te atendió:
                    </label>
                    <select
                      value={selectedBarber}
                      onChange={(e) => setSelectedBarber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white px-2.5 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    >
                      {barbers.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.nickname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Servicio:
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white px-2.5 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tu Testimonio *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Cuéntanos qué tal quedó tu corte, la puntualidad y la atención..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    Publicar Reseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
