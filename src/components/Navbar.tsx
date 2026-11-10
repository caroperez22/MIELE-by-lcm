import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Shield, Menu, X, Heart, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { formatCOP } from '../services/api.js';

interface NavbarProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  isAdminLoggedIn,
  onNavigate,
  activeSection
}) => {
  const { totalItemsCount, total, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'catalogo', label: 'Cremas Vintage' },
    { id: 'ruleta', label: 'Ruleta MIELE', highlight: true },
    { id: 'beneficios', label: 'Beneficios' },
    { id: 'nosotros', label: 'Sobre Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F0]/95 backdrop-blur-md border-b border-[#D6B779]/20 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#4B3529] text-[#FFF9F0] text-xs font-medium py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#D6B779] animate-pulse" />
        <span>Envíos a toda Colombia • Envíos gratis por compras superiores a $100.000 COP</span>
        <span className="hidden sm:inline text-[#D6B779]">•</span>
        <button
          onClick={() => onNavigate('ruleta')}
          className="hidden sm:inline-flex items-center gap-1 text-[#D6B779] hover:underline cursor-pointer font-semibold"
        >
          <Gift className="w-3 h-3" /> Gira la Ruleta y Gana
        </button>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => handleLinkClick('inicio')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D6B779] to-[#B88752] flex items-center justify-center text-[#FFF9F0] shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-serif font-bold text-xl tracking-tighter">M</span>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-[#4B3529] block leading-none">
                MIELE
              </span>
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.25em] text-[#B88752]">
                by lcm
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map(link => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3 py-2 text-sm font-medium tracking-wide transition-all rounded-md cursor-pointer relative ${
                    isActive
                      ? 'text-[#B88752] font-semibold'
                      : 'text-[#4B3529]/80 hover:text-[#B88752]'
                  } ${link.highlight ? 'bg-[#F5EFE6] text-[#B88752] border border-[#D6B779]/40' : ''}`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.highlight && <Gift className="w-3.5 h-3.5 text-[#B88752]" />}
                    {link.label}
                  </span>
                  {isActive && !link.highlight && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#B88752] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Admin button & Cart trigger */}
          <div className="flex items-center gap-3">
            {/* Admin portal trigger */}
            <button
              onClick={onOpenAdmin}
              title="Panel Administrativo"
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${
                isAdminLoggedIn
                  ? 'bg-[#B88752] text-white border-[#B88752]'
                  : 'border-[#D6B779]/40 text-[#4B3529]/70 hover:text-[#4B3529] hover:bg-[#F5EFE6]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">{isAdminLoggedIn ? 'Admin Activo' : 'Admin'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#B88752] text-white hover:bg-[#9A6A38] transition-all shadow-sm hover:shadow cursor-pointer"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase">
                Mi Bolsa
              </span>
              {totalItemsCount > 0 ? (
                <span className="bg-white text-[#4B3529] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              ) : (
                <span className="text-xs text-white/90">0</span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#4B3529] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9F0] border-b border-[#D6B779]/30 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between cursor-pointer ${
                activeSection === link.id
                  ? 'bg-[#F5EFE6] text-[#B88752] font-semibold'
                  : 'text-[#4B3529] hover:bg-[#F5EFE6]'
              }`}
            >
              <span className="flex items-center gap-2">
                {link.highlight && <Gift className="w-4 h-4 text-[#B88752]" />}
                {link.label}
              </span>
              {link.highlight && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D6B779]/30 text-[#4B3529]">
                  Premios
                </span>
              )}
            </button>
          ))}
          <div className="pt-3 border-t border-[#D6B779]/20 flex justify-between items-center px-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="text-xs text-[#B88752] font-medium flex items-center gap-1.5 cursor-pointer hover:underline"
            >
              <Shield className="w-3.5 h-3.5" />
              Acceso Administrativo
            </button>
            <span className="text-xs text-[#4B3529]/60">MIELE by lcm © 2026</span>
          </div>
        </div>
      )}
    </header>
  );
};
