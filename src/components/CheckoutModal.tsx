import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShoppingBag, Truck, ArrowRight, ShieldCheck, MapPin, Phone, Mail, User, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { placeOrder, formatCOP } from '../services/api.js';
import type { Order } from '../types.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onRefreshCatalog: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onRefreshCatalog,
}) => {
  const { items, subtotal, discountAmount, shippingCost, total, appliedCoupon, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: 'Medellín',
    department: 'Antioquia',
    deliveryAddress: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Strict validation
    if (!formData.customerName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.trim().length < 7) {
      setErrorMessage('Por favor ingresa un número de celular válido para coordinar la entrega.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Por favor especifica tu ciudad de entrega.');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      setErrorMessage('Por favor especifica la dirección completa de entrega.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('El carrito no contiene productos.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim() || undefined,
        city: formData.city.trim(),
        department: formData.department.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        notes: formData.notes.trim() || undefined,
        discountCode: appliedCoupon?.code,
      };

      const createdOrder = await placeOrder(payload);

      // Successfully registered and inventory atomically updated on server!
      clearCart();
      onRefreshCatalog();
      onOrderSuccess(createdOrder);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el pedido. Por favor verifica los datos o la disponibilidad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-[#FFF9F0] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#D6B779]/40 my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#D6B779]/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88752] block">
              Compra Rápida y Segura
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#4B3529]">
              Finalizar Pedido MIELE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#4B3529]/60 hover:text-[#4B3529] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
            aria-label="Cerrar checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Order Summary Box */}
          <div className="bg-[#F5EFE6] p-4 rounded-2xl border border-[#D6B779]/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#4B3529]">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#B88752]" /> Resumen de Productos ({items.length})
              </span>
              <span className="text-[#B88752] font-bold">Total: {formatCOP(total)}</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between items-center text-xs text-[#4B3529]/80 bg-white/70 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold text-[#4B3529] line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-[#4B3529]/60">{item.quantity} x {formatCOP(item.product.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#4B3529]">{formatCOP(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Calculations breakdown */}
            <div className="text-xs space-y-1 pt-2 border-t border-[#D6B779]/20 text-[#4B3529]/75">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento ({appliedCoupon?.code}):</span>
                  <span>- {formatCOP(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>{shippingCost === 0 ? 'GRATIS' : formatCOP(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#4B3529] pt-1 border-t border-[#D6B779]/20">
                <span>Total a confirmar:</span>
                <span className="text-[#B88752] font-serif text-base">{formatCOP(total)}</span>
              </div>
            </div>
          </div>

          {/* Form Fields: Datos del Comprador */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-[#4B3529] flex items-center gap-2">
              <User className="w-4 h-4 text-[#B88752]" /> Datos del Destinatario
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#B88752] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Ej. Camila Morales"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                  Celular / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#B88752] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="Ej. 312 456 7890"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                Correo electrónico <span className="text-xs text-[#4B3529]/50 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B88752] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="Para recibir el comprobante (ej. camila@ejemplo.com)"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
                />
              </div>
            </div>
          </div>

          {/* Form Fields: Dirección de Entrega */}
          <div className="space-y-4 pt-2 border-t border-[#D6B779]/20">
            <h4 className="font-serif text-lg font-bold text-[#4B3529] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B88752]" /> Dirección de Entrega
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Ej. Medellín, Bogotá, Cali..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Ej. Antioquia, Cundinamarca..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                Dirección exacta (Calle, Carrera, Apto / Torre) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Ej. Calle 10 # 43E-20, Apto 402, El Poblado"
                className="w-full px-3 py-2 text-sm bg-white border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                Observaciones del pedido <span className="text-xs text-[#4B3529]/50 font-normal">(Opcional)</span>
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instrucciones para la entrega (ej. Dejar en portería, timbre que suena, etc.)"
                className="w-full px-3 py-2 text-sm bg-white border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
              />
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#D6B779]/30 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-[#B88752] hover:bg-[#9A6A38] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Validando inventario y registrando...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Pedido ({formatCOP(total)})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#4B3529]/60">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#B88752]" /> Envío Nacional
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B88752]" /> Inventario Seguro
              </span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
