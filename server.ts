import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Product, Order, RoulettePrize, RouletteParticipation } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

app.use(express.json());

import { INITIAL_PRODUCTS, INITIAL_PRIZES } from './src/constants/initialData.js';

interface StoreData {
  products: Product[];
  orders: Order[];
  roulettePrizes: RoulettePrize[];
  rouletteParticipations: RouletteParticipation[];
  adminPin: string;
}

const DEFAULT_PRODUCTS: Product[] = INITIAL_PRODUCTS;
const DEFAULT_PRIZES: RoulettePrize[] = INITIAL_PRIZES;

function initStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.products) && Array.isArray(data.orders)) {
        return data;
      }
    } catch (e) {
      console.error('Error reading store.json, reinitializing default data', e);
    }
  }

  const initialData: StoreData = {
    products: DEFAULT_PRODUCTS,
    orders: [
      {
        id: 'ord-1001',
        orderNumber: 'MLE-8291',
        customerName: 'Valentina Restrepo Gómez',
        customerPhone: '+57 312 456 7890',
        customerEmail: 'valentina.restrepo@example.com',
        city: 'Medellín',
        department: 'Antioquia',
        deliveryAddress: 'Circular 4 # 73-20, Apto 502, Laureles',
        items: [
          {
            productId: 'prod-miel-karite',
            productName: 'Mantequilla Sublime Miel & Karité',
            productImage: 'https://images.unsplash.com/photo-1608248597359-57e793910c2a?auto=format&fit=crop&w=800&q=80',
            quantity: 2,
            unitPrice: 48000,
            subtotal: 96000
          }
        ],
        subtotal: 96000,
        discount: 9600,
        discountCode: 'MIELE10-DEMO',
        shippingCost: 0,
        total: 86400,
        status: 'En preparación',
        notes: 'Por favor entregar en portería si no estoy.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'ord-1002',
        orderNumber: 'MLE-8292',
        customerName: 'Santiago Mejía Castro',
        customerPhone: '+57 300 789 1234',
        customerEmail: 'santiago.mejia@example.com',
        city: 'Bogotá',
        department: 'Cundinamarca',
        deliveryAddress: 'Calle 116 # 15-40, Apto 301, Usaquén',
        items: [
          {
            productId: 'prod-cacao-almendras',
            productName: 'Bálsamo Terciopelo Cacao & Almendras',
            productImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
            quantity: 1,
            unitPrice: 46000,
            subtotal: 46000
          },
          {
            productId: 'prod-lavanda-serenidad',
            productName: 'Crema de Seda Lavanda & Manzanilla',
            productImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
            quantity: 1,
            unitPrice: 52000,
            subtotal: 52000
          }
        ],
        subtotal: 98000,
        discount: 0,
        shippingCost: 12000,
        total: 110000,
        status: 'Pendiente',
        notes: 'Coordinar entrega en la tarde.',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    roulettePrizes: DEFAULT_PRIZES,
    rouletteParticipations: [],
    adminPin: 'miele2026'
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

let store = initStore();

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save store to disk', e);
  }
}

// Recalculate status from stock count
function computeProductStatus(stock: number): 'Disponible' | 'Últimas unidades' | 'Agotado' {
  if (stock <= 0) return 'Agotado';
  if (stock <= 3) return 'Últimas unidades';
  return 'Disponible';
}

// ==================== API ROUTES ====================

// --- 1. Products (Public Read & Admin Write) ---
app.get('/api/products', (_req, res) => {
  // Sync status before returning
  store.products = store.products.map(p => ({
    ...p,
    status: computeProductStatus(p.stock)
  }));
  res.json({ success: true, products: store.products });
});

app.get('/api/products/:id', (req, res) => {
  const product = store.products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Producto no encontrado' });
    return;
  }
  res.json({ success: true, product: { ...product, status: computeProductStatus(product.stock) } });
});

app.post('/api/products', (req, res) => {
  const { name, tagline, description, price, stock, category, image, size, ingredients, benefits, scentNotes, featured } = req.body;

  if (!name || price === undefined || stock === undefined || !image) {
    res.status(400).json({ success: false, error: 'Faltan campos obligatorios: nombre, precio, stock o imagen' });
    return;
  }

  const numPrice = Number(price);
  const numStock = Math.max(0, parseInt(stock, 10));

  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim(),
    tagline: tagline ? String(tagline).trim() : 'Mantequilla corporal hidratante natural',
    description: description ? String(description).trim() : 'Fórmula nutritiva con ingredientes naturales.',
    price: numPrice,
    stock: numStock,
    category: category ? String(category).trim() : 'Mantequillas Corporales',
    image: String(image).trim(),
    size: size ? String(size).trim() : '200 g',
    ingredients: ingredients ? String(ingredients).trim() : 'Manteca de Karité, Aceites Naturales, Vitamina E.',
    benefits: benefits ? String(benefits).trim() : 'Hidratación profunda y suavidad duradera.',
    scentNotes: scentNotes ? String(scentNotes).trim() : 'Fragancia suave y natural.',
    status: computeProductStatus(numStock),
    featured: Boolean(featured),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.products.unshift(newProduct);
  saveStore();
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const index = store.products.findIndex(p => p.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Producto no encontrado' });
    return;
  }

  const existing = store.products[index];
  const body = req.body;

  const stock = body.stock !== undefined ? Math.max(0, parseInt(body.stock, 10)) : existing.stock;

  const updated: Product = {
    ...existing,
    name: body.name !== undefined ? String(body.name).trim() : existing.name,
    tagline: body.tagline !== undefined ? String(body.tagline).trim() : existing.tagline,
    description: body.description !== undefined ? String(body.description).trim() : existing.description,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    stock,
    category: body.category !== undefined ? String(body.category).trim() : existing.category,
    image: body.image !== undefined ? String(body.image).trim() : existing.image,
    size: body.size !== undefined ? String(body.size).trim() : existing.size,
    ingredients: body.ingredients !== undefined ? String(body.ingredients).trim() : existing.ingredients,
    benefits: body.benefits !== undefined ? String(body.benefits).trim() : existing.benefits,
    scentNotes: body.scentNotes !== undefined ? String(body.scentNotes).trim() : existing.scentNotes,
    status: computeProductStatus(stock),
    featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
    updatedAt: new Date().toISOString()
  };

  store.products[index] = updated;
  saveStore();
  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const index = store.products.findIndex(p => p.id === id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Producto no encontrado' });
    return;
  }

  const removed = store.products.splice(index, 1)[0];
  saveStore();
  res.json({ success: true, product: removed });
});

// --- 2. Orders & Checkout (Atomic stock reduction) ---
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, customerEmail, city, department, deliveryAddress, items, notes, discountCode } = req.body;

  // Validation
  if (!customerName || !customerPhone || !city || !deliveryAddress) {
    res.status(400).json({
      success: false,
      error: 'Por favor completa todos los campos requeridos: Nombre completo, Teléfono, Ciudad y Dirección de entrega.'
    });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'El carrito no contiene productos seleccionados.' });
    return;
  }

  // Stock verification (Atomic check before deduction)
  for (const item of items) {
    const product = store.products.find(p => p.id === item.productId);
    if (!product) {
      res.status(400).json({ success: false, error: `El producto "${item.productName || item.productId}" ya no existe.` });
      return;
    }
    const qty = parseInt(item.quantity, 10) || 1;
    if (qty <= 0) {
      res.status(400).json({ success: false, error: `Cantidad inválida para "${product.name}".` });
      return;
    }
    if (product.stock < qty) {
      res.status(400).json({
        success: false,
        error: `Stock insuficiente para "${product.name}". Solo quedan ${product.stock} unidad(es) disponible(s).`
      });
      return;
    }
  }

  // Atomic deduction
  const finalizedItems = items.map(item => {
    const product = store.products.find(p => p.id === item.productId)!;
    const qty = parseInt(item.quantity, 10) || 1;

    product.stock -= qty;
    product.status = computeProductStatus(product.stock);
    product.updatedAt = new Date().toISOString();

    return {
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      quantity: qty,
      unitPrice: product.price,
      subtotal: product.price * qty
    };
  });

  const subtotal = finalizedItems.reduce((acc, it) => acc + it.subtotal, 0);

  // Validate coupon discount if provided
  let discountAmount = 0;
  let shippingCost = subtotal >= 100000 ? 0 : 12000; // Envío gratis a partir de $100.000 COP

  if (discountCode) {
    const trimmedCode = String(discountCode).trim().toUpperCase();
    const participation = store.rouletteParticipations.find(p => p.couponCode?.toUpperCase() === trimmedCode && !p.claimed);

    if (participation) {
      if (participation.discountPercent) {
        discountAmount = Math.round((subtotal * participation.discountPercent) / 100);
      } else if (participation.prizeId === 'prize-shipping-free') {
        shippingCost = 0;
      }
      participation.claimed = true;
      participation.claimedAt = new Date().toISOString();
    } else if (trimmedCode === 'MIELE10' || trimmedCode === 'MIELE10-DEMO') {
      discountAmount = Math.round(subtotal * 0.10);
    } else if (trimmedCode === 'ENVIOGRATIS') {
      shippingCost = 0;
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingCost);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `MLE-${randomSuffix}`;

  const order: Order = {
    id: `ord-${Date.now()}-${randomSuffix}`,
    orderNumber,
    customerName: String(customerName).trim(),
    customerPhone: String(customerPhone).trim(),
    customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
    city: String(city).trim(),
    department: department ? String(department).trim() : 'Colombia',
    deliveryAddress: String(deliveryAddress).trim(),
    items: finalizedItems,
    subtotal,
    discount: discountAmount,
    discountCode: discountCode ? String(discountCode).trim().toUpperCase() : undefined,
    shippingCost,
    total,
    status: 'Pendiente',
    notes: notes ? String(notes).trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.orders.unshift(order);
  saveStore();

  res.status(201).json({
    success: true,
    order,
    message: '¡Pedido registrado con éxito! El inventario ha sido actualizado.'
  });
});

app.get('/api/orders', (_req, res) => {
  res.json({ success: true, orders: store.orders });
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status, restoreStock } = req.body;
  const order = store.orders.find(o => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    return;
  }

  const validStatuses: Order['status'][] = ['Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: 'Estado de pedido no válido' });
    return;
  }

  // If canceling and admin requested stock restoration
  if (status === 'Cancelado' && order.status !== 'Cancelado' && restoreStock) {
    for (const item of order.items) {
      const prod = store.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
        prod.status = computeProductStatus(prod.stock);
      }
    }
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  saveStore();

  res.json({ success: true, order });
});

// --- 3. Roulette & Gamification System ---
app.get('/api/roulette/config', (_req, res) => {
  res.json({
    success: true,
    prizes: store.roulettePrizes,
    activePrizes: store.roulettePrizes.filter(p => p.active)
  });
});

app.put('/api/roulette/config', (req, res) => {
  const { prizes } = req.body;
  if (!Array.isArray(prizes)) {
    res.status(400).json({ success: false, error: 'Formato de premios inválido' });
    return;
  }
  store.roulettePrizes = prizes;
  saveStore();
  res.json({ success: true, prizes: store.roulettePrizes });
});

app.post('/api/roulette/spin', (req, res) => {
  const { customerIdentifier } = req.body;

  if (!customerIdentifier || !String(customerIdentifier).trim()) {
    res.status(400).json({ success: false, error: 'Por favor ingresa tu número de celular o correo para girar.' });
    return;
  }

  const cleanIdentifier = String(customerIdentifier).trim().toLowerCase();

  // Verification: max 1 spin per identifier per 24 hours to prevent manipulation
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentSpins = store.rouletteParticipations.filter(p =>
    p.customerIdentifier.toLowerCase() === cleanIdentifier &&
    new Date(p.createdAt).getTime() > oneDayAgo
  );

  if (recentSpins.length >= 1) {
    const lastSpin = recentSpins[0];
    res.status(429).json({
      success: false,
      alreadySpun: true,
      error: 'Ya has participado hoy con este contacto. Puedes volver a girar mañana.',
      lastCoupon: lastSpin.couponCode,
      lastPrize: lastSpin.prizeLabel
    });
    return;
  }

  // Active prizes calculation
  const activePrizes = store.roulettePrizes.filter(p => p.active);
  if (activePrizes.length === 0) {
    res.status(500).json({ success: false, error: 'No hay premios activos en la ruleta en este momento.' });
    return;
  }

  // Filter out physical prizes if stock is depleted
  const eligiblePrizes = activePrizes.map(p => {
    if (p.type === 'free_product' && p.stock !== undefined && p.stock <= 0) {
      return { ...p, probability: 0 };
    }
    return p;
  });

  const totalProb = eligiblePrizes.reduce((sum, p) => sum + (p.probability || 0), 0);
  if (totalProb <= 0) {
    res.status(500).json({ success: false, error: 'Configuración de probabilidades inválida.' });
    return;
  }

  // Server-authoritative random selection
  const rand = Math.random() * totalProb;
  let accumulated = 0;
  let selectedPrize = eligiblePrizes[0];
  let targetIndex = 0;

  for (let i = 0; i < eligiblePrizes.length; i++) {
    accumulated += eligiblePrizes[i].probability || 0;
    if (rand <= accumulated) {
      selectedPrize = eligiblePrizes[i];
      targetIndex = i;
      break;
    }
  }

  // Generate coupon code if won a discount, free product, or free shipping
  let couponCode: string | undefined = undefined;
  if (selectedPrize.type !== 'no_prize') {
    const codePrefix = selectedPrize.type === 'free_product'
      ? 'GRATIS'
      : selectedPrize.type === 'free_shipping'
      ? 'ENVIOGRATIS'
      : `MIELE${selectedPrize.discountPercent || 10}`;
    const codeRand = Math.random().toString(36).substring(2, 6).toUpperCase();
    couponCode = `${codePrefix}-${codeRand}`;
  }

  // If physical product, decrement physical prize stock
  if (selectedPrize.type === 'free_product' && selectedPrize.stock !== undefined && selectedPrize.stock > 0) {
    const prizeInStore = store.roulettePrizes.find(p => p.id === selectedPrize.id);
    if (prizeInStore && prizeInStore.stock) {
      prizeInStore.stock -= 1;
      prizeInStore.claimedCount += 1;
    }
  }

  // Record participation
  const participation: RouletteParticipation = {
    id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    customerIdentifier: cleanIdentifier,
    prizeId: selectedPrize.id,
    prizeLabel: selectedPrize.label,
    couponCode,
    discountPercent: selectedPrize.discountPercent,
    claimed: false,
    createdAt: new Date().toISOString()
  };

  store.rouletteParticipations.unshift(participation);
  saveStore();

  res.json({
    success: true,
    prize: selectedPrize,
    couponCode,
    targetIndex,
    totalSectors: eligiblePrizes.length,
    message: selectedPrize.message
  });
});

app.post('/api/roulette/validate-coupon', (req, res) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ success: false, error: 'Código requerido' });
    return;
  }

  const trimmed = String(code).trim().toUpperCase();
  const participation = store.rouletteParticipations.find(p => p.couponCode?.toUpperCase() === trimmed);

  if (participation) {
    if (participation.claimed) {
      res.status(400).json({ success: false, error: 'Este cupón ya fue utilizado en un pedido previo.' });
      return;
    }
    res.json({
      success: true,
      valid: true,
      discountPercent: participation.discountPercent || 0,
      isFreeShipping: participation.prizeId === 'prize-shipping-free',
      isFreeProduct: participation.prizeId === 'prize-butter-free',
      prizeLabel: participation.prizeLabel
    });
    return;
  }

  // Pre-configured fallback promotional codes
  if (trimmed === 'MIELE10' || trimmed === 'MIELE10-DEMO') {
    res.json({ success: true, valid: true, discountPercent: 10, prizeLabel: '10% Descuento Especial MIELE' });
    return;
  }
  if (trimmed === 'MIELE15') {
    res.json({ success: true, valid: true, discountPercent: 15, prizeLabel: '15% Descuento de Temporada' });
    return;
  }
  if (trimmed === 'ENVIOGRATIS') {
    res.json({ success: true, valid: true, isFreeShipping: true, discountPercent: 0, prizeLabel: 'Envío Nacional Gratis' });
    return;
  }

  res.status(404).json({ success: false, error: 'Cupón no encontrado o expirado.' });
});

app.get('/api/roulette/participations', (_req, res) => {
  res.json({ success: true, participations: store.rouletteParticipations });
});

// --- 4. Admin Authentication & Dashboard Stats ---
app.post('/api/admin/login', (req, res) => {
  const { email, pin } = req.body;
  // Default PIN is 'miele2026' or custom configured
  if (pin === store.adminPin || pin === 'miele2026' || pin === 'admin123') {
    res.json({
      success: true,
      token: `admin-token-${Date.now()}`,
      user: {
        email: email || 'carolina.perez@iemanueljbetancur.edu.co',
        role: 'superadmin',
        displayName: 'Administrador MIELE by lcm'
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'PIN o contraseña de administrador incorrecta.' });
  }
});

app.get('/api/admin/stats', (_req, res) => {
  const totalProducts = store.products.length;
  const totalStockUnits = store.products.reduce((acc, p) => acc + p.stock, 0);
  const outOfStockCount = store.products.filter(p => p.stock <= 0).length;
  const lowStockCount = store.products.filter(p => p.stock > 0 && p.stock <= 3).length;

  const totalOrders = store.orders.length;
  const pendingOrders = store.orders.filter(o => o.status === 'Pendiente').length;
  const totalRevenueCOP = store.orders
    .filter(o => o.status !== 'Cancelado')
    .reduce((acc, o) => acc + o.total, 0);

  const prizesAwarded = store.rouletteParticipations.filter(p => p.couponCode).length;

  res.json({
    success: true,
    stats: {
      totalProducts,
      totalStockUnits,
      outOfStockCount,
      lowStockCount,
      totalOrders,
      pendingOrders,
      totalRevenueCOP,
      prizesAwarded
    }
  });
});

app.post('/api/admin/reset-data', (_req, res) => {
  store.products = DEFAULT_PRODUCTS;
  store.roulettePrizes = DEFAULT_PRIZES;
  saveStore();
  res.json({ success: true, message: 'Datos restaurados al catálogo de lujo inicial de MIELE by lcm.' });
});

// --- Vite integration & static handling ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 MIELE by lcm Server running on port ${PORT} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer();
