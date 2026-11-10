import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, PackageX, ShoppingBag, Plus, Minus, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import type { Product } from '../types.js';
import { formatCOP } from '../services/api.js';
import { useCart } from '../context/CartContext.js';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectBuy: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectBuy,
}) => {
  const { addToCart, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0 || product.status === 'Agotado';
  const maxAvailable = Math.max(1, product.stock);

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      onClose();
      openCart();
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      onDirectBuy(product, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-[#FFF9F0] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-[#D6B779]/40 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#4B3529] flex items-center justify-center shadow-md transition-all cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image & Stock highlight */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-[#F5EFE6] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('/src/assets/images/')) {
                  target.src = target.src.replace('/src/assets/images/', '/images/').replace(/_\d+\.jpg$/, '.jpg');
                } else if (!target.src.includes('vintage_hero_cream.jpg')) {
                  target.src = '/images/vintage_hero_cream.jpg';
                }
              }}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-[#4B3529] shadow-sm border border-[#D6B779]/30">
                {product.size}
              </span>
            </div>

            {/* Bottom Floating Stock Notice */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#D6B779]/40 shadow-md">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#4B3529]/80">Inventario actual:</span>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 font-bold text-red-600">
                    <PackageX className="w-3.5 h-3.5" /> Producto Agotado
                  </span>
                ) : product.stock <= 3 ? (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5" /> ¡Solo quedan {product.stock} disponibles!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {product.stock} unidades listas para envío
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Full Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            
            <div className="space-y-4">
              {/* Category & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#B88752]">
                  {product.category}
                </span>
                <span className="text-xs font-medium text-[#4B3529]/60">
                  Ref: {product.id.substring(0, 10)}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4B3529] leading-tight">
                  {product.name}
                </h3>
                <p className="text-xs text-[#B88752] font-medium mt-1">
                  {product.tagline}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-[#4B3529]">
                    {formatCOP(product.price)}
                  </span>
                  <span className="text-xs font-medium text-[#4B3529]/60">COP / IVA incluido</span>
                </div>
              </div>

              {/* Scent notes pill */}
              {product.scentNotes && (
                <div className="p-3 bg-[#F5EFE6] rounded-xl border border-[#D6B779]/30">
                  <span className="text-xs font-bold text-[#4B3529] flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B88752]" /> Perfil Aromático & Notas:
                  </span>
                  <p className="text-xs text-[#4B3529]/80">{product.scentNotes}</p>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4B3529]/70 mb-1">
                  Descripción
                </h4>
                <p className="text-xs sm:text-sm text-[#4B3529]/80 leading-relaxed font-light">
                  {product.description}
                </p>
              </div>

              {/* Ingredients & Benefits */}
              <div className="space-y-3 pt-2 border-t border-[#D6B779]/20 text-xs">
                {product.ingredients && (
                  <div>
                    <h5 className="font-bold text-[#4B3529] mb-0.5">Ingredientes Puros:</h5>
                    <p className="text-[#4B3529]/75 italic leading-relaxed">{product.ingredients}</p>
                  </div>
                )}
                {product.benefits && (
                  <div>
                    <h5 className="font-bold text-[#4B3529] mb-0.5">Beneficios en tu Piel:</h5>
                    <p className="text-[#4B3529]/75 leading-relaxed">{product.benefits}</p>
                  </div>
                )}
              </div>

              {/* Quality markers */}
              <div className="pt-2 flex items-center gap-4 text-[11px] text-[#4B3529]/70">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B88752]" /> Piel sensible
                </span>
                <span className="flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#B88752]" /> Cruelty-free
                </span>
              </div>
            </div>

            {/* Quantity Selector & Purchase Actions */}
            <div className="pt-4 border-t border-[#D6B779]/30 space-y-3">
              {!isOutOfStock ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#4B3529]">Cantidad a ordenar:</span>
                    <div className="flex items-center border border-[#D6B779] rounded-xl bg-white overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-3 py-1.5 text-[#4B3529] hover:bg-[#F5EFE6] disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 py-1 font-semibold text-sm text-[#4B3529] min-w-[2.5rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1.5 text-[#4B3529] hover:bg-[#F5EFE6] disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      className="py-3 px-4 rounded-xl border border-[#B88752] text-[#B88752] hover:bg-[#B88752] hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Añadir a Bolsa</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="py-3 px-4 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Comprar Ahora</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-center space-y-2">
                  <p className="text-xs font-semibold text-red-800">
                    Este producto se encuentra agotado temporalmente.
                  </p>
                  <p className="text-[11px] text-red-600">
                    Nuestro boticario artesanal está elaborando un nuevo lote. Puedes consultar las demás cremas corporales vintage de nuestro catálogo.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
