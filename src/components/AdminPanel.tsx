import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Gift,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  Database,
  Search,
  LogOut,
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import type { Product, Order, RoulettePrize, RouletteParticipation, AdminStats } from '../types.js';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchOrders,
  updateOrderStatus,
  fetchRouletteConfig,
  updateRoulettePrizes,
  fetchRouletteParticipations,
  fetchAdminStats,
  resetCatalogData,
  formatCOP,
} from '../services/api.js';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  adminUser: any;
  onProductUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  adminUser,
  onProductUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'roulette' | 'firebase'>('dashboard');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [prizes, setPrizes] = useState<RoulettePrize[]>([]);
  const [participations, setParticipations] = useState<RouletteParticipation[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product Edit / Create Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // In-app notifications (avoids window.alert inside iframe)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all admin data
  const loadData = async () => {
    setLoading(true);
    try {
      const [s, prods, ords, rConf, parts] = await Promise.all([
        fetchAdminStats(),
        fetchProducts(),
        fetchOrders(),
        fetchRouletteConfig(),
        fetchRouletteParticipations(),
      ]);
      setStats(s);
      setProducts(prods);
      setOrders(ords);
      setPrizes(rConf.prizes);
      setParticipations(parts);
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Product Handlers ---
  const handleOpenCreateProduct = () => {
    setEditingProduct({
      name: '',
      tagline: '',
      description: '',
      price: 48000,
      stock: 10,
      category: 'Cremas Corporales Vintage',
      size: '250 ml / Tarro Cerámica',
      ingredients: 'Miel Pura de Abejas, Manteca de Karité batida, Aceite de Almendras vírgenes, Vitamina E.',
      benefits: 'Nutrición de botica profunda y regeneración duradera.',
      scentNotes: 'Miel silvestre y vainilla antigua.',
      image: '/images/vintage_hero_cream.jpg',
      featured: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || editingProduct.price === undefined) return;

    try {
      if (editingProduct.id) {
        await updateProduct(editingProduct.id, editingProduct);
        showToast('Producto actualizado correctamente');
      } else {
        await createProduct(editingProduct);
        showToast('Nuevo producto registrado con éxito');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadData();
      onProductUpdated();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar producto', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    try {
      await deleteProduct(id);
      showToast(`Producto "${name}" eliminado`);
      await loadData();
      onProductUpdated();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar producto', 'error');
    }
  };

  const handleQuickStockChange = async (prod: Product, delta: number) => {
    const newStock = Math.max(0, prod.stock + delta);
    try {
      await updateProduct(prod.id, { stock: newStock });
      await loadData();
      onProductUpdated();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar stock', 'error');
    }
  };

  // --- Order Handlers ---
  const handleOrderStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Estado de pedido actualizado a "${newStatus}"`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar estado', 'error');
    }
  };

  // --- Roulette Handlers ---
  const handleTogglePrizeActive = async (prizeId: string) => {
    const updated = prizes.map(p => (p.id === prizeId ? { ...p, active: !p.active } : p));
    setPrizes(updated);
    try {
      await updateRoulettePrizes(updated);
      showToast('Premios de ruleta actualizados');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrizeProbChange = async (prizeId: string, newProb: number) => {
    const updated = prizes.map(p => (p.id === prizeId ? { ...p, probability: Number(newProb) } : p));
    setPrizes(updated);
    try {
      await updateRoulettePrizes(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrizeStockChange = async (prizeId: string, newStock: number) => {
    const updated = prizes.map(p => (p.id === prizeId ? { ...p, stock: Number(newStock) } : p));
    setPrizes(updated);
    try {
      await updateRoulettePrizes(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCatalog = async () => {
    const msg = await resetCatalogData();
    showToast(msg);
    await loadData();
    onProductUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-[#D6B779]/40 flex flex-col h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#4B3529] text-[#FFF9F0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B88752] flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold tracking-wide">
                  Panel de Administración MIELE
                </h3>
                <span className="text-[10px] bg-[#D6B779] text-[#4B3529] font-bold px-2 py-0.5 rounded-full uppercase">
                  Gestión Total
                </span>
              </div>
              <p className="text-xs text-[#FFF9F0]/70">
                Sesión activa: <span className="text-[#D6B779] font-medium">{adminUser?.email || 'carolina.perez@iemanueljbetancur.edu.co'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Recargar datos"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFF9F0] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="p-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FFF9F0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
              toastMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-[#F5EFE6] px-6 pt-3 border-b border-[#D6B779]/30 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white text-[#B88752] border-t-2 border-[#B88752] shadow-xs'
                : 'text-[#4B3529]/70 hover:text-[#4B3529]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-white text-[#B88752] border-t-2 border-[#B88752] shadow-xs'
                : 'text-[#4B3529]/70 hover:text-[#4B3529]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario de Productos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-white text-[#B88752] border-t-2 border-[#B88752] shadow-xs'
                : 'text-[#4B3529]/70 hover:text-[#4B3529]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos de Clientes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roulette')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'roulette'
                ? 'bg-white text-[#B88752] border-t-2 border-[#B88752] shadow-xs'
                : 'text-[#4B3529]/70 hover:text-[#4B3529]'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Gestión de Ruleta & Premios</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'bg-white text-[#B88752] border-t-2 border-[#B88752] shadow-xs'
                : 'text-[#4B3529]/70 hover:text-[#4B3529]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Arquitectura & Firestore</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FFF9F0]/50">
          
          {/* ================= 1. DASHBOARD ================= */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs">
                  <div className="flex items-center justify-between text-[#B88752] mb-2">
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5EFE6] px-2 py-0.5 rounded-md">
                      Catálogo
                    </span>
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#4B3529] block">
                    {stats.totalProducts}
                  </span>
                  <span className="text-xs text-[#4B3529]/70">
                    Productos registrados
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                      Stock
                    </span>
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#4B3529] block">
                    {stats.totalStockUnits}
                  </span>
                  <span className="text-xs text-[#4B3529]/70">
                    Unidades físicas en almacén
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs">
                  <div className="flex items-center justify-between text-amber-600 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md">
                      Pocas Unid.
                    </span>
                  </div>
                  <span className="font-serif text-3xl font-bold text-amber-700 block">
                    {stats.lowStockCount}
                  </span>
                  <span className="text-xs text-[#4B3529]/70">
                    Productos con ≤ 3 unidades
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs">
                  <div className="flex items-center justify-between text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-800 px-2 py-0.5 rounded-md">
                      Agotados
                    </span>
                  </div>
                  <span className="font-serif text-3xl font-bold text-red-700 block">
                    {stats.outOfStockCount}
                  </span>
                  <span className="text-xs text-[#4B3529]/70">
                    Productos con 0 existencias
                  </span>
                </div>

              </div>

              {/* Second Row Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs">
                  <div className="flex items-center justify-between text-[#B88752] mb-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5EFE6] px-2 py-0.5 rounded-md">
                      Pedidos
                    </span>
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#4B3529] block">
                    {stats.totalOrders}
                  </span>
                  <p className="text-xs text-[#4B3529]/70 mt-1">
                    <strong className="text-amber-700">{stats.pendingOrders} pedidos pendientes</strong> por despachar
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-700 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                      Ingresos
                    </span>
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#4B3529] block">
                    {formatCOP(stats.totalRevenueCOP)}
                  </span>
                  <span className="text-xs text-[#4B3529]/70">
                    Ventas totales acumuladas (COP)
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs">
                  <div className="flex items-center justify-between text-[#B88752] mb-2">
                    <Gift className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5EFE6] px-2 py-0.5 rounded-md">
                      Ruleta
                    </span>
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#4B3529] block">
                    {stats.prizesAwarded}
                  </span>
                  <span className="text-xs text-[#4B3529]/70">
                    Cupones y premios entregados
                  </span>
                </div>

              </div>

              {/* Quick Actions & Low Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Low Stock Watchlist */}
                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-serif text-lg font-bold text-[#4B3529] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Alertas Críticas de Stock
                    </h4>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-[#B88752] font-semibold hover:underline"
                    >
                      Gestionar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {products
                      .filter(p => p.stock <= 3)
                      .slice(0, 4)
                      .map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2.5 bg-[#FFF9F0] rounded-xl border border-[#D6B779]/20 text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src.includes('/src/assets/images/')) {
                                  target.src = target.src.replace('/src/assets/images/', '/images/').replace(/_\d+\.jpg$/, '.jpg');
                                } else if (!target.src.includes('vintage_hero_cream.jpg')) {
                                  target.src = '/images/vintage_hero_cream.jpg';
                                }
                              }}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-bold text-[#4B3529]">{p.name}</p>
                              <p className="text-[10px] text-[#4B3529]/60">{formatCOP(p.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={p.stock === 0 ? 'text-red-700 font-bold' : 'text-amber-700 font-bold'}>
                              {p.stock === 0 ? 'Agotado' : `${p.stock} unid.`}
                            </span>
                            <button
                              onClick={() => handleQuickStockChange(p, 5)}
                              className="px-2 py-1 rounded-md bg-[#B88752] text-white text-[10px] font-semibold hover:bg-[#9A6A38] cursor-pointer"
                            >
                              +5 Stock
                            </button>
                          </div>
                        </div>
                      ))}
                    {products.filter(p => p.stock <= 3).length === 0 && (
                      <p className="text-xs text-emerald-700 py-3 text-center">
                        ✓ Todos los productos cuentan con suficiente inventario disponible.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[#4B3529]">
                    Acciones de Mantenimiento
                  </h4>

                  <div className="space-y-2.5">
                    <button
                      onClick={handleOpenCreateProduct}
                      className="w-full py-3 px-4 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Registrar Nueva Crema Corporal Vintage</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full py-3 px-4 rounded-xl border border-[#D6B779] hover:bg-[#F5EFE6] text-[#4B3529] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#B88752]" />
                      <span>Revisar Pedidos Pendientes ({stats.pendingOrders})</span>
                    </button>

                    <button
                      onClick={handleResetCatalog}
                      className="w-full py-3 px-4 rounded-xl border border-red-300 hover:bg-red-50 text-red-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Restaurar Catálogo Predeterminado de Lujo</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= 2. PRODUCTS INVENTORY ================= */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#B88752] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D6B779]/40 rounded-xl text-[#4B3529] focus:outline-none focus:ring-1 focus:ring-[#B88752]"
                  />
                </div>

                <button
                  onClick={handleOpenCreateProduct}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Producto</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-[#D6B779]/30 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#4B3529]">
                    <thead className="bg-[#F5EFE6] text-[#4B3529] font-bold border-b border-[#D6B779]/30">
                      <tr>
                        <th className="p-3">Producto</th>
                        <th className="p-3">Precio (COP)</th>
                        <th className="p-3">Stock Físico</th>
                        <th className="p-3">Estado Público</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6B779]/20">
                      {products
                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(product => (
                          <tr key={product.id} className="hover:bg-[#FFF9F0]/60 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
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
                                  className="w-12 h-12 rounded-xl object-cover bg-[#F5EFE6] shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-sm text-[#4B3529]">{product.name}</p>
                                  <p className="text-[11px] text-[#4B3529]/60 line-clamp-1">{product.tagline}</p>
                                  <span className="text-[10px] text-[#B88752] font-semibold">{product.size}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 font-serif font-bold text-sm">
                              {formatCOP(product.price)}
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuickStockChange(product, -1)}
                                  className="w-6 h-6 rounded-md bg-[#F5EFE6] hover:bg-[#EAD9C0] text-[#4B3529] font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className={`font-bold px-2 py-0.5 rounded-md min-w-[2rem] text-center ${
                                  product.stock === 0 ? 'bg-red-100 text-red-800' : product.stock <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                                }`}>
                                  {product.stock}
                                </span>
                                <button
                                  onClick={() => handleQuickStockChange(product, 1)}
                                  className="w-6 h-6 rounded-md bg-[#F5EFE6] hover:bg-[#EAD9C0] text-[#4B3529] font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                product.stock === 0
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : product.stock <= 3
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}>
                                {product.status}
                              </span>
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(product)}
                                  className="p-1.5 rounded-lg bg-[#F5EFE6] hover:bg-[#EAD9C0] text-[#4B3529] transition-colors cursor-pointer"
                                  title="Editar producto"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#B88752]" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. ORDERS MANAGEMENT ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-2xl border border-[#D6B779]/30 text-xs">
                {['all', 'Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'].map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                      orderStatusFilter === st
                        ? 'bg-[#B88752] text-white shadow-xs'
                        : 'text-[#4B3529]/70 hover:bg-[#F5EFE6]'
                    }`}
                  >
                    {st === 'all' ? `Todos (${orders.length})` : st}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {orders
                  .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                  .map(order => (
                    <div
                      key={order.id}
                      className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-[#D6B779]/20">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-bold text-[#B88752]">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-[#4B3529]/60">
                              {new Date(order.createdAt).toLocaleString('es-CO')}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#4B3529]">
                            {order.customerName} • {order.customerPhone}
                          </p>
                        </div>

                        {/* Order status dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#4B3529]/70">Estado:</span>
                          <select
                            value={order.status}
                            onChange={e => handleOrderStatusChange(order.id, e.target.value as any)}
                            className="text-xs font-bold py-1.5 px-3 rounded-xl border border-[#D6B779] bg-[#FFF9F0] text-[#4B3529] focus:outline-none"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="En preparación">En preparación</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      {/* Items & Address */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 bg-[#FFF9F0] p-3 rounded-xl">
                          <p className="font-bold text-[#4B3529] mb-1">Productos:</p>
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-[#4B3529]/80">
                              <span>{it.quantity}x {it.productName}</span>
                              <span className="font-medium">{formatCOP(it.subtotal)}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-[#D6B779]/20 flex justify-between font-bold text-[#4B3529]">
                            <span>Total del pedido:</span>
                            <span className="text-[#B88752] font-serif text-sm">{formatCOP(order.total)}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 bg-[#FFF9F0] p-3 rounded-xl">
                          <p className="font-bold text-[#4B3529] mb-1">Destino de entrega:</p>
                          <p className="text-[#4B3529]/80 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#B88752]" />
                            {order.deliveryAddress}, {order.city} ({order.department})
                          </p>
                          {order.notes && (
                            <p className="text-[#4B3529]/70 italic">
                              Nota: "{order.notes}"
                            </p>
                          )}
                          {order.discountCode && (
                            <p className="text-emerald-700 font-semibold">
                              Cupón aplicado: {order.discountCode} (-{formatCOP(order.discount)})
                            </p>
                          )}

                          {/* Quick WhatsApp message to customer */}
                          <div className="pt-2">
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customerName}, te escribimos de MIELE by lcm respecto a tu pedido ${order.orderNumber}. Queremos informarte que se encuentra: ${order.status}. ¡Gracias por preferirnos!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                            >
                              <Phone className="w-3 h-3" /> Escribir al cliente por WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {orders.length === 0 && (
                  <p className="text-center py-12 text-xs text-[#4B3529]/60">
                    Aún no se han recibido pedidos.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= 4. ROULETTE & PRIZES ================= */}
          {activeTab === 'roulette' && (
            <div className="space-y-6">
              
              {/* Prize Config List */}
              <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-serif text-xl font-bold text-[#4B3529]">
                      Configuración de Premios de la Ruleta
                    </h4>
                    <p className="text-xs text-[#4B3529]/70">
                      Ajusta probabilidades y disponibilidad física. Los cambios se sincronizan de inmediato con el servidor.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {prizes.map(prize => (
                    <div
                      key={prize.id}
                      className="p-3.5 rounded-xl border border-[#D6B779]/30 bg-[#FFF9F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs shrink-0"
                          style={{ backgroundColor: prize.color, color: prize.textColor }}
                        >
                          %
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#4B3529]">{prize.label}</p>
                          <p className="text-[11px] text-[#4B3529]/60">Tipo: {prize.type}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {/* Probability setting */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#4B3529]/70">Probabilidad:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={prize.probability}
                            onChange={e => handlePrizeProbChange(prize.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-[#D6B779]/40 rounded-lg text-center font-bold"
                          />
                          <span>%</span>
                        </div>

                        {/* Physical Stock if applicable */}
                        {prize.type === 'free_product' && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#4B3529]/70">Stock regalo:</span>
                            <input
                              type="number"
                              min="0"
                              value={prize.stock ?? 0}
                              onChange={e => handlePrizeStockChange(prize.id, Number(e.target.value))}
                              className="w-16 px-2 py-1 bg-white border border-[#D6B779]/40 rounded-lg text-center font-bold"
                            />
                            <span>unid.</span>
                          </div>
                        )}

                        {/* Active switch */}
                        <button
                          onClick={() => handleTogglePrizeActive(prize.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                            prize.active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-500 border border-gray-300'
                          }`}
                        >
                          {prize.active ? 'Activo' : 'Desactivado'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Participations log */}
              <div className="bg-white p-5 rounded-2xl border border-[#D6B779]/30 shadow-xs space-y-3">
                <h4 className="font-serif text-lg font-bold text-[#4B3529]">
                  Historial de Giros y Participantes ({participations.length})
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#4B3529]">
                    <thead className="bg-[#F5EFE6] text-[#4B3529] font-bold">
                      <tr>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">Participante</th>
                        <th className="p-2.5">Premio</th>
                        <th className="p-2.5">Código Cupón</th>
                        <th className="p-2.5">Estado Canje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6B779]/20">
                      {participations.map(p => (
                        <tr key={p.id}>
                          <td className="p-2.5 text-[#4B3529]/60">
                            {new Date(p.createdAt).toLocaleString('es-CO')}
                          </td>
                          <td className="p-2.5 font-medium">{p.customerIdentifier}</td>
                          <td className="p-2.5 font-semibold text-[#B88752]">{p.prizeLabel}</td>
                          <td className="p-2.5 font-mono">{p.couponCode || 'N/A'}</td>
                          <td className="p-2.5">
                            {p.claimed ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                Canjeado
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                                Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {participations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-[#4B3529]/60">
                            Aún no se registran giros en la ruleta.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================= 5. FIREBASE & ARCHITECTURE ================= */}
          {activeTab === 'firebase' && (
            <div className="bg-white p-6 rounded-3xl border border-[#D6B779]/30 shadow-xs space-y-6 text-xs text-[#4B3529]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88752] block">
                  Estructura y Persistencia
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#4B3529]">
                  Arquitectura de Datos y Firebase Firestore
                </h4>
                <p className="text-xs text-[#4B3529]/75 mt-1">
                  MIELE by lcm cuenta con backend full-stack con persistencia en disco y esquemas listos para Firestore.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5EFE6] rounded-2xl border border-[#D6B779]/30 space-y-2">
                  <span className="font-bold text-sm text-[#4B3529] block">1. Archivos de Especificación</span>
                  <ul className="space-y-1 text-[#4B3529]/80 list-disc list-inside">
                    <li><code>firebase-blueprint.json</code>: Esquemas de productos, pedidos, usuarios y ruleta.</li>
                    <li><code>firestore.rules</code>: Reglas ABAC con validación atómica y protección contra sobreescrituras.</li>
                    <li><code>server.ts</code>: Operaciones atómicas de inventario y cálculo de probabilidades.</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#F5EFE6] rounded-2xl border border-[#D6B779]/30 space-y-2">
                  <span className="font-bold text-sm text-[#4B3529] block">2. Seguridad de Acceso</span>
                  <ul className="space-y-1 text-[#4B3529]/80 list-disc list-inside">
                    <li>Catálogo y stock en tiempo real 100% público (sin login requerido).</li>
                    <li>Registro de pedidos sin obligar al cliente a crear cuenta.</li>
                    <li>Panel administrativo protegido por PIN y token seguro.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal for Creating / Editing Products */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-[#D6B779]/40 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-serif text-2xl font-bold text-[#4B3529]">
                {editingProduct.id ? 'Editar Crema Corporal Vintage' : 'Nueva Crema Corporal Vintage'}
              </h4>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-[#4B3529]/60 hover:text-[#4B3529]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#4B3529] mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ej. Crema Corporal de Botica Miel Real"
                  className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4B3529] mb-1">Frase Corta / Tagline</label>
                <input
                  type="text"
                  value={editingProduct.tagline || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                  placeholder="Nutrición profunda y terciopelo para la piel"
                  className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4B3529] mb-1">Precio (COP)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price ?? 48000}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4B3529] mb-1">Cantidad en Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock ?? 10}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#4B3529] mb-1">Tamaño / Gramaje</label>
                  <input
                    type="text"
                    value={editingProduct.size || '200 g / 7.0 oz'}
                    onChange={e => setEditingProduct({ ...editingProduct, size: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4B3529] mb-1">Categoría</label>
                  <input
                    type="text"
                    value={editingProduct.category || 'Cremas Corporales Vintage'}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4B3529] mb-1">URL de Fotografía</label>
                <input
                  type="url"
                  required
                  value={editingProduct.image || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4B3529] mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4B3529] mb-1">Ingredientes Principales</label>
                <input
                  type="text"
                  value={editingProduct.ingredients || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, ingredients: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4B3529] mb-1">Perfil Aromático / Notas</label>
                <input
                  type="text"
                  value={editingProduct.scentNotes || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, scentNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={Boolean(editingProduct.featured)}
                  onChange={e => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                  className="rounded text-[#B88752] focus:ring-[#B88752]"
                />
                <label htmlFor="featuredCheck" className="text-xs font-semibold text-[#4B3529]">
                  Marcar como Producto Destacado en Página Principal
                </label>
              </div>

              <div className="pt-4 border-t border-[#D6B779]/30 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
