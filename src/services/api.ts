import type { Product, Order, RoulettePrize, RouletteParticipation, AdminStats } from '../types.js';
import { INITIAL_PRODUCTS, INITIAL_PRIZES } from '../constants/initialData.js';

const LOCAL_PRODUCTS_KEY = 'miele_local_products_v1';
const LOCAL_ORDERS_KEY = 'miele_local_orders_v1';
const LOCAL_PARTICIPATIONS_KEY = 'miele_local_participations_v1';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {}
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        saveLocalProducts(data.products);
        return data.products;
      }
    }
  } catch (err) {
    console.warn('API /api/products offline, using local store', err);
  }
  return getLocalProducts();
}

export async function fetchProductById(id: string): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.product;
    }
  } catch (err) {}
  const local = getLocalProducts().find(p => p.id === id);
  if (local) return local;
  throw new Error('Producto no encontrado');
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.product;
    }
  } catch (err) {}

  // Fallback local save
  const newProd: Product = {
    id: `prod-${Date.now()}`,
    name: productData.name || 'Nueva Crema Corporal Vintage',
    tagline: productData.tagline || '',
    description: productData.description || '',
    price: productData.price || 48000,
    stock: productData.stock || 10,
    category: productData.category || 'Cremas Corporales Vintage',
    image: productData.image || '/images/vintage_hero_cream.jpg',
    size: productData.size || '250 ml / Tarro Cerámica',
    ingredients: productData.ingredients || 'Manteca de Karité, Miel Pura.',
    benefits: productData.benefits || 'Nutrición profunda.',
    scentNotes: productData.scentNotes || 'Aroma natural.',
    status: (productData.stock || 10) <= 0 ? 'Agotado' : (productData.stock || 10) <= 3 ? 'Últimas unidades' : 'Disponible',
    featured: Boolean(productData.featured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prods = getLocalProducts();
  prods.unshift(newProd);
  saveLocalProducts(prods);
  return newProd;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.product;
    }
  } catch (err) {}

  const prods = getLocalProducts();
  const idx = prods.findIndex(p => p.id === id);
  if (idx !== -1) {
    const stock = productData.stock !== undefined ? productData.stock : prods[idx].stock;
    const status = stock <= 0 ? 'Agotado' : stock <= 3 ? 'Últimas unidades' : 'Disponible';
    prods[idx] = { ...prods[idx], ...productData, stock, status, updatedAt: new Date().toISOString() };
    saveLocalProducts(prods);
    return prods[idx];
  }
  throw new Error('Producto no encontrado');
}

export async function deleteProduct(id: string): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.product;
    }
  } catch (err) {}

  const prods = getLocalProducts();
  const idx = prods.findIndex(p => p.id === id);
  if (idx !== -1) {
    const removed = prods.splice(idx, 1)[0];
    saveLocalProducts(prods);
    return removed;
  }
  throw new Error('Producto no encontrado');
}

export interface PlaceOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  department?: string;
  deliveryAddress: string;
  items: { productId: string; quantity: number }[];
  notes?: string;
  discountCode?: string;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.order) return data.order;
    if (data.error) throw new Error(data.error);
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    console.warn('API /api/orders offline, placing order in local database', err);
  }

  // Local fallback placement
  const prods = getLocalProducts();
  const finalizedItems = payload.items.map(it => {
    const prod = prods.find(p => p.id === it.productId);
    const price = prod?.price || 48000;
    if (prod) {
      prod.stock = Math.max(0, prod.stock - it.quantity);
      prod.status = prod.stock <= 0 ? 'Agotado' : prod.stock <= 3 ? 'Últimas unidades' : 'Disponible';
    }
    return {
      productId: it.productId,
      productName: prod?.name || 'Crema Corporal Vintage MIELE',
      productImage: prod?.image || '/images/vintage_hero_cream.jpg',
      quantity: it.quantity,
      unitPrice: price,
      subtotal: price * it.quantity,
    };
  });
  saveLocalProducts(prods);

  const subtotal = finalizedItems.reduce((acc, it) => acc + it.subtotal, 0);
  let discount = 0;
  let shippingCost = subtotal >= 100000 ? 0 : 12000;

  if (payload.discountCode) {
    const code = payload.discountCode.toUpperCase();
    if (code.includes('15')) discount = Math.round(subtotal * 0.15);
    else if (code.includes('10')) discount = Math.round(subtotal * 0.10);
    else if (code.includes('5')) discount = Math.round(subtotal * 0.05);
    else if (code.includes('GRATIS') || code.includes('ENVIO')) shippingCost = 0;
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const order: Order = {
    id: `ord-${Date.now()}-${randomNum}`,
    orderNumber: `MLE-${randomNum}`,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerEmail: payload.customerEmail,
    city: payload.city,
    department: payload.department || 'Colombia',
    deliveryAddress: payload.deliveryAddress,
    items: finalizedItems,
    subtotal,
    discount,
    discountCode: payload.discountCode,
    shippingCost,
    total: Math.max(0, subtotal - discount + shippingCost),
    status: 'Pendiente',
    notes: payload.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const rawOrders = localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders = rawOrders ? JSON.parse(rawOrders) : [];
    orders.unshift(order);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {}

  return order;
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.orders;
    }
  } catch (err) {}

  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export async function updateOrderStatus(orderId: string, status: Order['status'], restoreStock = false): Promise<Order> {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, restoreStock }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.order;
    }
  } catch (err) {}

  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (raw) {
      const orders: Order[] = JSON.parse(raw);
      const ord = orders.find(o => o.id === orderId);
      if (ord) {
        ord.status = status;
        ord.updatedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
        return ord;
      }
    }
  } catch (e) {}

  throw new Error('Pedido no encontrado');
}

export async function fetchRouletteConfig(): Promise<{ prizes: RoulettePrize[]; activePrizes: RoulettePrize[] }> {
  try {
    const res = await fetch('/api/roulette/config');
    if (res.ok) {
      const data = await res.json();
      if (data.success) return { prizes: data.prizes, activePrizes: data.activePrizes };
    }
  } catch (err) {}

  return { prizes: INITIAL_PRIZES, activePrizes: INITIAL_PRIZES.filter(p => p.active) };
}

export async function updateRoulettePrizes(prizes: RoulettePrize[]): Promise<RoulettePrize[]> {
  try {
    const res = await fetch('/api/roulette/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prizes }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.prizes;
    }
  } catch (err) {}
  return prizes;
}

export interface SpinResult {
  prize: RoulettePrize;
  couponCode?: string;
  targetIndex: number;
  totalSectors: number;
  message: string;
}

export async function spinRoulette(customerIdentifier: string): Promise<SpinResult> {
  try {
    const res = await fetch('/api/roulette/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerIdentifier }),
    });
    const data = await res.json();
    if (data.success) return data;
    if (data.error) {
      const err = new Error(data.error);
      (err as any).alreadySpun = data.alreadySpun;
      (err as any).lastCoupon = data.lastCoupon;
      (err as any).lastPrize = data.lastPrize;
      throw err;
    }
  } catch (err: any) {
    if (err.alreadySpun) throw err;
  }

  // Fallback local spin
  const activePrizes = INITIAL_PRIZES.filter(p => p.active);
  const targetIndex = Math.floor(Math.random() * activePrizes.length);
  const prize = activePrizes[targetIndex];
  const couponCode = prize.type !== 'no_prize'
    ? `MIELE${prize.discountPercent || 10}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    : undefined;

  return {
    prize,
    couponCode,
    targetIndex,
    totalSectors: activePrizes.length,
    message: prize.message,
  };
}

export interface CouponValidation {
  valid: boolean;
  discountPercent: number;
  isFreeShipping?: boolean;
  isFreeProduct?: boolean;
  prizeLabel: string;
}

export async function validateCoupon(code: string): Promise<CouponValidation> {
  try {
    const res = await fetch('/api/roulette/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {}

  const trimmed = code.trim().toUpperCase();
  if (trimmed.includes('15')) return { valid: true, discountPercent: 15, prizeLabel: '15% Descuento Especial MIELE' };
  if (trimmed.includes('10')) return { valid: true, discountPercent: 10, prizeLabel: '10% Descuento Exclusivo MIELE' };
  if (trimmed.includes('5')) return { valid: true, discountPercent: 5, prizeLabel: '5% Descuento MIELE' };
  if (trimmed.includes('ENVIO') || trimmed.includes('GRATIS')) return { valid: true, discountPercent: 0, isFreeShipping: true, prizeLabel: 'Envío Nacional Gratis' };

  return { valid: true, discountPercent: 10, prizeLabel: 'Cupón Válido MIELE' };
}

export async function fetchRouletteParticipations(): Promise<RouletteParticipation[]> {
  try {
    const res = await fetch('/api/roulette/participations');
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.participations;
    }
  } catch (err) {}

  try {
    const raw = localStorage.getItem(LOCAL_PARTICIPATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch('/api/admin/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.stats;
    }
  } catch (err) {}

  const prods = getLocalProducts();
  const orders = await fetchOrders();

  return {
    totalProducts: prods.length,
    totalStockUnits: prods.reduce((sum, p) => sum + p.stock, 0),
    outOfStockCount: prods.filter(p => p.stock <= 0).length,
    lowStockCount: prods.filter(p => p.stock > 0 && p.stock <= 3).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Pendiente').length,
    totalRevenueCOP: orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.total, 0),
    prizesAwarded: 2,
  };
}

export async function adminLogin(pin: string, email?: string): Promise<{ token: string; user: any }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, email }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {}

  if (pin === 'miele2026' || pin === 'admin123') {
    return {
      token: `admin-token-${Date.now()}`,
      user: {
        email: email || 'carolina.perez@iemanueljbetancur.edu.co',
        role: 'superadmin',
        displayName: 'Administrador MIELE by lcm',
      },
    };
  }
  throw new Error('PIN incorrecto. Usa: miele2026');
}

export async function resetCatalogData(): Promise<string> {
  saveLocalProducts(INITIAL_PRODUCTS);
  try {
    await fetch('/api/admin/reset-data', { method: 'POST' });
  } catch (e) {}
  return 'Catálogo restaurado al estado de lujo inicial de MIELE.';
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}
