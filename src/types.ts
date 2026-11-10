export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number; // En Pesos Colombianos (COP)
  stock: number;
  category: string;
  image: string;
  size: string; // ej. "200 g"
  ingredients: string;
  benefits: string;
  scentNotes: string;
  status: 'Disponible' | 'Últimas unidades' | 'Agotado';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  department: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingCost: number;
  total: number;
  status: 'Pendiente' | 'Confirmado' | 'En preparación' | 'Enviado' | 'Entregado' | 'Cancelado';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoulettePrize {
  id: string;
  label: string;
  type: 'discount' | 'free_product' | 'free_shipping' | 'no_prize';
  discountPercent?: number;
  productId?: string;
  color: string;
  textColor: string;
  probability: number; // Porcentaje de probabilidad (0 - 100)
  stock?: number; // Para premios físicos limitados
  claimedCount: number;
  active: boolean;
  message: string;
}

export interface RouletteParticipation {
  id: string;
  customerIdentifier: string;
  prizeId: string;
  prizeLabel: string;
  couponCode?: string;
  discountPercent?: number;
  claimed: boolean;
  claimedAt?: string;
  associatedOrderId?: string;
  createdAt: string;
}

export interface AdminStats {
  totalProducts: number;
  totalStockUnits: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenueCOP: number;
  prizesAwarded: number;
}
