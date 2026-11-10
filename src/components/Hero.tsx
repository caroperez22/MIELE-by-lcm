import React from 'react';
import { Sparkles, ArrowRight, Gift, Droplets, ShieldCheck, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onExploreCatalog: () => void;
  onSpinRoulette: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCatalog, onSpinRoulette }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F0] via-[#F5EFE6] to-[#FFF9F0] py-16 sm:py-24 lg:py-28 border-b border-[#D6B779]/20">
      {/* Subtle decorative circles */}
      <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-[#D6B779]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#B88752]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9F0] border border-[#D6B779]/50 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#B88752]" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[#4B3529]">
                Botica & Cremas Corporales Vintage
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#4B3529] tracking-tight leading-[1.08]">
              Un toque de suavidad, <br />
              <span className="italic font-normal text-[#B88752]">una experiencia vintage</span> <br />
              para tu piel.
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[#4B3529]/80 font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              En <strong className="font-semibold text-[#4B3529]">MIELE by lcm</strong> formulamos exclusivamente <strong className="font-semibold text-[#B88752]">cremas corporales vintage</strong> inspiradas en las boticas francesas del siglo XIX: botes cerámicos de emulsión rica con miel virgen silvestre, cera de abejas y flores medicinales.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreCatalog}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#B88752] hover:bg-[#9A6A38] text-white font-semibold text-sm sm:text-base tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Explorar Cremas Vintage</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onSpinRoulette}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#FFF9F0] hover:bg-[#F5EFE6] text-[#4B3529] border border-[#D6B779] font-semibold text-sm sm:text-base tracking-wide shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-[#B88752]" />
                <span>Girar la Ruleta MIELE</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-[#D6B779]/30 text-center lg:text-left">
              <div>
                <span className="block font-serif text-2xl sm:text-3xl font-bold text-[#4B3529]">1888</span>
                <span className="text-xs text-[#4B3529]/70 font-medium">Inspiración de Botica</span>
              </div>
              <div>
                <span className="block font-serif text-2xl sm:text-3xl font-bold text-[#4B3529]">100%</span>
                <span className="text-xs text-[#4B3529]/70 font-medium">Cremas Corporales Puras</span>
              </div>
              <div>
                <span className="block font-serif text-2xl sm:text-3xl font-bold text-[#4B3529]">48h</span>
                <span className="text-xs text-[#4B3529]/70 font-medium">Nutrición & Tersura</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Frame */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#D6B779]/30 via-transparent to-[#B88752]/20 blur-lg transform -rotate-1" />

              {/* Main Product Feature Card */}
              <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-[#D6B779]/30">
                <div className="aspect-4/3 relative overflow-hidden bg-[#F5EFE6]">
                  <img
                    src="/src/assets/images/vintage_hero_cream_1794345712552.jpg"
                    alt="Crema Corporal Vintage MIELE by lcm"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-[#FFF9F0]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#D6B779]/40 text-xs font-semibold text-[#4B3529] flex items-center gap-1.5 shadow-xs">
                    <Droplets className="w-3.5 h-3.5 text-[#B88752]" />
                    <span>Receta de Boticario</span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-[#4B3529]/90 backdrop-blur-md text-[#FFF9F0] px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide">
                    Tarro Cerámica Vintage
                  </div>
                </div>

                <div className="p-6 bg-[#FFF9F0] border-t border-[#D6B779]/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#4B3529]">
                        Crema Corporal de Botica Miel Real
                      </h3>
                      <p className="text-xs text-[#B88752] font-medium mt-0.5">
                        Emulsión clásica con vainilla francesa y miel pura
                      </p>
                    </div>
                    <span className="font-serif text-lg font-bold text-[#4B3529] bg-[#F5EFE6] px-3 py-1 rounded-md border border-[#D6B779]/30">
                      $48.000 COP
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[#4B3529]/70 pt-3 border-t border-[#D6B779]/15">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#B88752]" /> Auténtico Vintage
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-[#B88752]" /> Hecho en Colombia
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Pill Accent */}
              <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-lg border border-[#D6B779]/30 hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center text-[#B88752]">
                  <Gift className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4B3529]">¿Primera vez aquí?</p>
                  <p className="text-[11px] text-[#B88752] font-medium">Gira y gana hasta 15% OFF</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
