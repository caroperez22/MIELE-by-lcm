import React from 'react';
import { CheckCircle, MessageSquare, Copy, Check, ShoppingBag, Truck, Calendar, MapPin, Phone, User } from 'lucide-react';
import type { Order } from '../types.js';
import { formatCOP } from '../services/api.js';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppLink = () => {
    const phone = '573124567890'; // MIELE by lcm official shop WhatsApp
    const itemsText = order.items.map(i => `• ${i.quantity}x ${i.productName} (${formatCOP(i.subtotal)})`).join('\n');
    const message = `¡Hola MIELE by lcm! 🌸\nAcabo de realizar mi pedido en su tienda web:\n\n*Número de Pedido:* ${order.orderNumber}\n*Nombre:* ${order.customerName}\n*Ciudad:* ${order.city}\n*Dirección:* ${order.deliveryAddress}\n*Celular:* ${order.customerPhone}\n\n*Productos:*\n${itemsText}\n\n*Total a Pagar:* ${formatCOP(order.total)}\n\n¿Me confirman para coordinar el despacho? ¡Muchas gracias!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-[#FFF9F0] w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-[#D6B779]/40 my-6 p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88752] block">
            ¡Muchas gracias por tu compra!
          </span>
          <h3 className="font-serif text-3xl font-bold text-[#4B3529]">
            Pedido Confirmado
          </h3>
          <p className="text-xs sm:text-sm text-[#4B3529]/75 max-w-md mx-auto">
            Hemos reservado tus productos y actualizado nuestro inventario de forma segura.
          </p>
        </div>

        {/* Order Number Card */}
        <div className="mt-6 bg-white p-4 rounded-2xl border border-[#D6B779]/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#4B3529]/60 font-medium block">
              Número Único de Pedido:
            </span>
            <span className="font-serif text-2xl font-bold text-[#B88752] tracking-wider">
              {order.orderNumber}
            </span>
          </div>
          <button
            onClick={handleCopyOrderNumber}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5EFE6] hover:bg-[#EAD9C0] text-[#4B3529] text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#B88752]" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Order Detail Summary */}
        <div className="mt-6 bg-[#F5EFE6] p-4 sm:p-5 rounded-2xl border border-[#D6B779]/30 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#D6B779]/20 font-semibold text-[#4B3529]">
            <span>Estado inicial:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {order.status}
            </span>
          </div>

          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-[#4B3529]">
              <User className="w-3.5 h-3.5 text-[#B88752]" />
              <strong>Cliente:</strong> {order.customerName}
            </p>
            <p className="flex items-center gap-1.5 text-[#4B3529]">
              <Phone className="w-3.5 h-3.5 text-[#B88752]" />
              <strong>Teléfono:</strong> {order.customerPhone}
            </p>
            <p className="flex items-center gap-1.5 text-[#4B3529]">
              <MapPin className="w-3.5 h-3.5 text-[#B88752]" />
              <strong>Entrega en:</strong> {order.deliveryAddress}, {order.city} ({order.department})
            </p>
          </div>

          <div className="pt-2 border-t border-[#D6B779]/20 space-y-1">
            <span className="font-bold text-[#4B3529] block mb-1">Cremas corporales solicitadas:</span>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[#4B3529]/80">
                <span>{it.quantity}x {it.productName}</span>
                <span className="font-medium text-[#4B3529]">{formatCOP(it.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#D6B779]/20 flex justify-between items-center text-sm font-bold text-[#4B3529]">
            <span>Total del pedido:</span>
            <span className="font-serif text-lg text-[#B88752]">{formatCOP(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Notificar mi pedido por WhatsApp a la tienda</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#F5EFE6] text-[#4B3529] border border-[#D6B779] font-semibold text-xs transition-colors cursor-pointer"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
};
