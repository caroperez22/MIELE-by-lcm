import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, AlertCircle, CheckCircle2, ShoppingBag, Eye, PackageX } from 'lucide-react';
import type { Product } from '../types.js';
import { formatCOP } from '../services/api.js';
import { useCart } from '../context/CartContext.js';

interface CatalogProps {
  products: Product[];
  isLoading: boolean;
  onSelectProduct: (product: Product) => void;
  onDirectBuy: (product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  products,
  isLoading,
  onSelectProduct,
  onDirectBuy,
}) => {
  const { addToCart, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Disponible' | 'Últimas unidades' | 'Agotado'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.scentNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default: featured first, then in-stock first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.stock - a.stock;
      });
  }, [products, searchQuery, statusFilter, sortBy]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
      openCart();
    }
  };

  const getStatusBadge = (product: Product) => {
    if (product.stock <= 0 || product.status === 'Agotado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <PackageX className="w-3 h-3" />
          Agotado
        </span>
      );
    }
    if (product.stock <= 3 || product.status === 'Últimas unidades') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          <AlertCircle className="w-3 h-3 text-amber-700" />
          ¡Últimas {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}!
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Disponible ({product.stock} en stock)
      </span>
    );
  };

  return (
    <section id="catalogo" className="py-20 bg-[#FFF9F0] border-b border-[#D6B779]/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE6] border border-[#D6B779]/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B88752]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#4B3529]">
              Botica de Cremas Corporales Vintage
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#4B3529] tracking-tight">
            Nuestras Cremas Corporales
          </h2>
          <p className="mt-3 text-base text-[#4B3529]/75 font-light">
            Recetas de botica de época con miel pura, aceites prensados en frío e infusiones herbales en tarros tradicionales. 
            Inventario público visible en tiempo real para todos nuestros visitantes sin necesidad de registro.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#D6B779]/30 shadow-xs mb-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#B88752] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, aroma o ingrediente..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529] placeholder-[#4B3529]/50"
              />
            </div>

            {/* Filter by Status */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#4B3529]/70 whitespace-nowrap hidden sm:inline">
                Estado:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 w-full bg-[#F5EFE6] p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`text-xs py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#4B3529] shadow-xs font-semibold'
                      : 'text-[#4B3529]/70 hover:text-[#4B3529]'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('Disponible')}
                  className={`text-xs py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === 'Disponible'
                      ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                      : 'text-[#4B3529]/70 hover:text-[#4B3529]'
                  }`}
                >
                  Disponibles
                </button>
                <button
                  onClick={() => setStatusFilter('Últimas unidades')}
                  className={`text-xs py-1.5 px-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === 'Últimas unidades'
                      ? 'bg-white text-amber-800 shadow-xs font-semibold'
                      : 'text-[#4B3529]/70 hover:text-[#4B3529]'
                  }`}
                >
                  Pocas unid.
                </button>
                <button
                  onClick={() => setStatusFilter('Agotado')}
                  className={`text-xs py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === 'Agotado'
                      ? 'bg-white text-red-800 shadow-xs font-semibold'
                      : 'text-[#4B3529]/70 hover:text-[#4B3529]'
                  }`}
                >
                  Agotados
                </button>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3 flex items-center justify-end gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#B88752]" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl text-[#4B3529] font-medium focus:outline-none focus:ring-2 focus:ring-[#B88752]"
              >
                <option value="featured">Destacados primero</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre: A - Z</option>
              </select>
            </div>

          </div>

          {/* Active summary */}
          <div className="flex justify-between items-center text-xs text-[#4B3529]/60 pt-2 border-t border-[#D6B779]/20">
            <span>
              Mostrando <strong className="text-[#4B3529]">{filteredProducts.length}</strong> de {products.length} productos
            </span>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-[#B88752] hover:underline font-semibold cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#D6B779]/20 animate-pulse p-4 space-y-4">
                <div className="h-64 bg-[#F5EFE6] rounded-xl" />
                <div className="h-6 bg-[#F5EFE6] rounded w-3/4" />
                <div className="h-4 bg-[#F5EFE6] rounded w-1/2" />
                <div className="h-10 bg-[#F5EFE6] rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#D6B779]/30 p-8 max-w-lg mx-auto">
            <PackageX className="w-12 h-12 text-[#B88752] mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-bold text-[#4B3529]">
              No se encontraron productos
            </h3>
            <p className="text-sm text-[#4B3529]/70 mt-1 mb-6">
              Prueba cambiando los términos de búsqueda o el filtro de disponibilidad.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-6 py-2.5 rounded-full bg-[#B88752] text-white font-medium text-sm hover:bg-[#9A6A38] transition-colors cursor-pointer"
            >
              Ver todos los productos
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0 || product.status === 'Agotado';

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#D6B779]/30 shadow-xs hover:shadow-xl hover:border-[#B88752]/60 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Product Image Card */}
                  <div className="relative aspect-4/3 overflow-hidden bg-[#F5EFE6]">
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
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Stock & Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {getStatusBadge(product)}
                    </div>

                    {/* Featured or Size Tag */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
                      {product.featured && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#B88752] text-white shadow-xs">
                          Destacado
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF9F0]/90 backdrop-blur-xs text-[#4B3529] border border-[#D6B779]/30">
                        {product.size}
                      </span>
                    </div>

                    {/* Quick View Hover Overlay */}
                    <div className="absolute inset-0 bg-[#4B3529]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-2 rounded-full bg-white/95 text-[#4B3529] text-xs font-semibold shadow-md flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#B88752]" />
                        Ver detalles completos
                      </span>
                    </div>
                  </div>

                  {/* Product Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif text-xl font-bold text-[#4B3529] group-hover:text-[#B88752] transition-colors leading-snug">
                          {product.name}
                        </h3>
                        <div className="text-right whitespace-nowrap">
                          <span className="font-serif text-lg font-bold text-[#4B3529] block">
                            {formatCOP(product.price)}
                          </span>
                          <span className="text-[10px] text-[#4B3529]/60 uppercase tracking-wider">COP</span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-[#4B3529]/75 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Scent note tag */}
                      {product.scentNotes && (
                        <p className="mt-3 text-[11px] text-[#B88752] font-medium flex items-center gap-1 bg-[#FFF9F0] px-2.5 py-1 rounded-md border border-[#D6B779]/20">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          <span className="truncate">{product.scentNotes}</span>
                        </p>
                      )}
                    </div>

                    {/* Stock Indicator Progress Bar */}
                    <div className="pt-2 border-t border-[#D6B779]/15">
                      <div className="flex justify-between text-[11px] mb-1 font-medium">
                        <span className="text-[#4B3529]/70">Disponibilidad pública:</span>
                        <span className={isOutOfStock ? 'text-red-600 font-bold' : product.stock <= 3 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                          {isOutOfStock ? '0 unidades' : `${product.stock} unidades en almacén`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F5EFE6] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOutOfStock
                              ? 'w-0'
                              : product.stock <= 3
                              ? 'bg-amber-500 w-1/4'
                              : 'bg-emerald-600 w-full'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl border border-[#D6B779] hover:bg-[#F5EFE6] text-[#4B3529] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#B88752]" />
                        <span>Detalles</span>
                      </button>

                      <button
                        disabled={isOutOfStock}
                        onClick={e => {
                          e.stopPropagation();
                          if (!isOutOfStock) {
                            onDirectBuy(product);
                          }
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          isOutOfStock
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                            : 'bg-[#B88752] hover:bg-[#9A6A38] text-white hover:shadow-md'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Agotado' : 'Comprar'}</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
