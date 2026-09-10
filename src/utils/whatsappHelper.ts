import { Appointment, Barber, ServiceItem, BarberShopConfig } from '../types';

/**
 * Creates an encoded WhatsApp Web/App direct link with pre-filled professional appointment confirmation
 */
export function generateWhatsAppBookingUrl(
  appointment: Appointment,
  barber: Barber,
  service: ServiceItem,
  config: BarberShopConfig
): string {
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');

  const dateParts = appointment.date.split('-');
  const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

  const message = `👋 ¡Hola *${config.shopName}*!

✂️ *SOLICITUD DE CONFIRMACIÓN DE TURNO*
----------------------------------------
💈 *Barbero:* ${barber.name} (${barber.nickname})
✨ *Servicio:* ${service.name}
📅 *Fecha:* ${formattedDate}
⏰ *Hora:* ${appointment.time} hs (Duración aprox: ${service.durationMinutes} min)
💵 *Precio Estimado:* ${config.currencySymbol}${appointment.totalPrice.toLocaleString()}

👤 *Datos del Cliente:*
• Nombre: ${appointment.clientName}
• Teléfono: ${appointment.clientPhone}
${appointment.notes ? `• Nota/Estilo: ${appointment.notes}\n` : ''}
📍 *Ubicación:* ${config.address}, ${config.neighborhood}

Quedo a la espera de la confirmación inmediata. ¡Muchas gracias!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates an arbitrary chat URL with the shop on WhatsApp
 */
export function generateGeneralWhatsAppUrl(config: BarberShopConfig, customText?: string): string {
  const cleanPhone = config.whatsappNumber.replace(/[^0-9]/g, '');
  const text = customText || `¡Hola ${config.shopName}! Quisiera consultar sobre turnos y servicios.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
