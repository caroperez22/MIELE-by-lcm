import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext.js';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { Catalog } from './components/Catalog.js';
import { RouletteSection } from './components/RouletteSection.js';
import { BenefitsSection } from './components/BenefitsSection.js';
import { AboutSection } from './components/AboutSection.js';
import { ContactSection } from './components/ContactSection.js';
import { Footer } from './components/Footer.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.js';
import { AdminLoginModal } from './components/AdminLoginModal.js';
import { AdminPanel } from './components/AdminPanel.js';
import { fetchProducts } from './services/api.js';
import { INITIAL_PRODUCTS } from './constants/initialData.js';
import type { Product, Order } from './types.js';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Admin user state from session
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('miele_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const prods = await fetchProducts();
      setProducts(prods);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAdminTrigger = () => {
    if (adminUser) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('miele_admin_token');
    sessionStorage.removeItem('miele_admin_user');
    setAdminUser(null);
    setIsAdminPanelOpen(false);
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#FFF9F0] text-[#4B3529]">
        {/* Navigation Bar */}
        <Navbar
          onOpenAdmin={handleOpenAdminTrigger}
          isAdminLoggedIn={Boolean(adminUser)}
          onNavigate={handleNavigate}
          activeSection={activeSection}
        />

        {/* Main Sections */}
        <main className="flex-1">
          <div id="inicio">
            <Hero
              onExploreCatalog={() => handleNavigate('catalogo')}
              onSpinRoulette={() => handleNavigate('ruleta')}
            />
          </div>

          <Catalog
            products={products}
            isLoading={isLoadingProducts}
            onSelectProduct={prod => setSelectedProduct(prod)}
            onDirectBuy={prod => {
              setSelectedProduct(prod);
            }}
          />

          <RouletteSection
            onGoToCatalog={() => handleNavigate('catalogo')}
          />

          <BenefitsSection />

          <AboutSection />

          <ContactSection />
        </main>

        {/* Footer */}
        <Footer
          onNavigate={handleNavigate}
          onOpenAdmin={handleOpenAdminTrigger}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDirectBuy={(prod, _quantity) => {
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Slide-over Cart Drawer */}
        <CartDrawer
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onExploreCatalog={() => handleNavigate('catalogo')}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={order => setConfirmedOrder(order)}
          onRefreshCatalog={loadProducts}
        />

        {/* Order Confirmation Screen */}
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
        />

        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={user => {
            setAdminUser(user);
            setIsAdminPanelOpen(true);
          }}
        />

        {/* Administrative Management Portal */}
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          onLogout={handleAdminLogout}
          adminUser={adminUser}
          onProductUpdated={loadProducts}
        />
      </div>
    </CartProvider>
  );
}
