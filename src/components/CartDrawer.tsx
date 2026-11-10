import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { formatCOP } from '../services/api.js';

interface CartDrawerProps {
  onOpenCheckout: () => void;
  onExploreCatalog: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout, onExploreCatalog }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 100000;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCouponCode(couponInput.trim());
    setIsValidatingCoupon(false);

    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#FFF9F0] h-full shadow-2xl flex flex-col justify-between border-l border-[#D6B779]/30"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D6B779]/30 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B88752]" />
            <h3 className="font-serif text-xl font-bold text-[#4B3529]">
              Mi Bolsa de Compra
            </h3>
            <span className="text-xs bg-[#F5EFE6] text-[#B88752] font-bold px-2 py-0.5 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-[#4B3529]/70 hover:text-[#4B3529] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
            aria-label="Cerrar bolsa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress indicator */}
        <div className="p-4 bg-[#F5EFE6] border-b border-[#D6B779]/20 text-xs">
          {shippingCost === 0 && subtotal > 0 ? (
            <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              ¡Felicidades! Tienes Envío Gratis para este pedido.
            </p>
          ) : (
            <div>
              <p className="text-[#4B3529] mb-1.5 font-medium">
                Agrega <strong className="text-[#B88752]">{formatCOP(neededForFreeShipping)}</strong> para obtener <strong className="font-semibold">Envío Gratis</strong>.
              </p>
              <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B88752] rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F5EFE6] text-[#B88752] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#4B3529]">
                Tu bolsa está vacía
              </h4>
              <p className="text-xs text-[#4B3529]/70 max-w-xs mx-auto">
                Explora nuestras cremas corporales vintage y regálale nutrición sublime de botica a tu piel.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  onExploreCatalog();
                }}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#B88752] text-white text-xs font-semibold hover:bg-[#9A6A38] transition-colors cursor-pointer"
              >
                Explorar Cremas Vintage
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.product.id}
                className="flex gap-3 bg-white p-3 rounded-2xl border border-[#D6B779]/30 shadow-2xs"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover bg-[#F5EFE6] shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#4B3529] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <span className="text-[11px] text-[#B88752] font-medium block">
                        {item.product.size}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#D6B779]/40 rounded-lg bg-[#FFF9F0]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-[#4B3529] hover:bg-[#F5EFE6] rounded-l-lg cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-[#4B3529]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 text-[#4B3529] hover:bg-[#F5EFE6] rounded-r-lg disabled:opacity-30 cursor-pointer"
                        title={item.quantity >= item.product.stock ? 'Stock máximo alcanzado' : ''}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-[#4B3529] block">
                        {formatCOP(item.product.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-[#4B3529]/60">
                          {formatCOP(item.product.price)} c/u
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer: Coupon & Summary */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-[#D6B779]/30 space-y-4">
            
            {/* Coupon Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#F5EFE6] rounded-xl border border-[#D6B779]/40 text-xs">
                  <div className="flex items-center gap-1.5 text-[#4B3529]">
                    <Tag className="w-3.5 h-3.5 text-[#B88752]" />
                    <span>
                      Cupón: <strong>{appliedCoupon.code}</strong> ({appliedCoupon.prizeLabel})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#B88752] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Código de cupón o ruleta"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#B88752] uppercase font-medium text-[#4B3529]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="px-3.5 py-2 rounded-xl bg-[#F5EFE6] hover:bg-[#EAD9C0] text-[#4B3529] text-xs font-semibold border border-[#D6B779]/50 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isValidatingCoupon ? '...' : 'Aplicar'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {couponSuccess}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-[#4B3529]/80 pt-2 border-t border-[#D6B779]/20">
              <div className="flex justify-between">
                <span>Subtotal productos:</span>
                <span className="font-medium text-[#4B3529]">{formatCOP(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Descuento aplicado:</span>
                  <span>- {formatCOP(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Costo de envío estimado:</span>
                <span className={shippingCost === 0 ? 'text-emerald-700 font-semibold' : 'font-medium text-[#4B3529]'}>
                  {shippingCost === 0 ? 'GRATIS' : formatCOP(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#4B3529] pt-2 border-t border-[#D6B779]/30">
                <span className="font-serif">Total a Pagar:</span>
                <span className="font-serif text-lg text-[#B88752]">{formatCOP(total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                closeCart();
                onOpenCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceder al Pago</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-[#4B3529]/60">
              Pago contra entrega o transferencia Nequi / Bancolombia / Daviplata. Sin registro previo.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
