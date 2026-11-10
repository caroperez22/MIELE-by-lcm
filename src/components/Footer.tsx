import React from 'react';
import { Sparkles, Shield, Heart, Gift } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-[#4B3529] text-[#FFF9F0] border-t border-[#D6B779]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D6B779] to-[#B88752] flex items-center justify-center text-[#FFF9F0] shadow-sm">
                <span className="font-serif font-bold text-xl tracking-tighter">M</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-widest text-[#FFF9F0] block leading-none">
                  MIELE
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#D6B779]">
                  by lcm
                </span>
              </div>
            </div>

            <p className="font-serif italic text-base text-[#D6B779]">
              "Un toque de suavidad, una experiencia para tu piel."
            </p>

            <p className="text-xs text-[#FFF9F0]/75 font-light leading-relaxed max-w-sm">
              Cremas corporales vintage artesanales de alta cosmética botánica. Inspiradas en fórmulas de época de 1888 y elaboradas con amor en Medellín, Colombia.
            </p>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-base font-bold text-[#D6B779] uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-[#FFF9F0]/80">
              <li>
                <button onClick={() => onNavigate('inicio')} className="hover:text-[#D6B779] transition-colors cursor-pointer">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-[#D6B779] transition-colors cursor-pointer">
                  Nuestro Catálogo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ruleta')} className="hover:text-[#D6B779] transition-colors cursor-pointer flex items-center gap-1 text-[#D6B779]">
                  <Gift className="w-3.5 h-3.5" /> Ruleta MIELE (Premios)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('beneficios')} className="hover:text-[#D6B779] transition-colors cursor-pointer">
                  Beneficios Botánicos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nosotros')} className="hover:text-[#D6B779] transition-colors cursor-pointer">
                  Sobre Nosotros
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contacto')} className="hover:text-[#D6B779] transition-colors cursor-pointer">
                  Contacto & Envíos
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Guarantees (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif text-base font-bold text-[#D6B779] uppercase tracking-wider">
              Medios de Pago y Despachos
            </h4>
            <p className="text-xs text-[#FFF9F0]/75 leading-relaxed">
              Aceptamos transferencias directas y pagos flexibles en Colombia para tu total tranquilidad:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-[#FFF9F0]/10 text-xs font-semibold text-[#FFF9F0] border border-[#D6B779]/20">
                Nequi
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#FFF9F0]/10 text-xs font-semibold text-[#FFF9F0] border border-[#D6B779]/20">
                Bancolombia
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#FFF9F0]/10 text-xs font-semibold text-[#FFF9F0] border border-[#D6B779]/20">
                Daviplata
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#FFF9F0]/10 text-xs font-semibold text-[#D6B779] border border-[#D6B779]/40 font-bold">
                Contra Entrega
              </span>
            </div>

            <div className="pt-3">
              <button
                onClick={onOpenAdmin}
                className="text-[11px] text-[#D6B779] hover:text-white flex items-center gap-1.5 cursor-pointer underline transition-colors"
              >
                <Shield className="w-3.5 h-3.5" /> Acceso Administrativo (Inventario & Pedidos)
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#FFF9F0]/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#FFF9F0]/60 gap-4">
          <p>© 2026 MIELE by lcm. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="w-3.5 h-3.5 text-[#D6B779] fill-[#D6B779]" /> para el cuidado y belleza de tu piel
          </p>
        </div>

      </div>
    </footer>
  );
};
