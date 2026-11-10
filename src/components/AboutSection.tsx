import React from 'react';
import { Sparkles, Heart, Award, Check } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="nosotros" className="py-20 bg-[#F5EFE6] border-b border-[#D6B779]/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image Mosaic */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              <div className="rounded-3xl overflow-hidden shadow-xl border-2 border-[#D6B779]/40 aspect-4/3 bg-white">
                <img
                  src="/src/assets/images/vintage_rose_cream_1794345714503.jpg"
                  alt="Cremas corporales vintage MIELE"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Quote Box */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white p-5 rounded-2xl shadow-xl border border-[#D6B779]/40 max-w-xs">
                <p className="font-serif italic text-xs sm:text-sm text-[#4B3529] leading-snug">
                  "El cuidado del cuerpo no es una rutina; es un momento de amor propio y calma."
                </p>
                <span className="block mt-2 text-[10px] uppercase font-bold tracking-widest text-[#B88752]">
                  — Equipo MIELE by lcm
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D6B779]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#B88752]" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[#4B3529]">
                Nuestra Esencia
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#4B3529] tracking-tight leading-tight">
              La Historia de MIELE by lcm
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#4B3529]/80 font-light leading-relaxed">
              <p>
                <strong>MIELE by lcm</strong> rescata el arte centenario de las <strong>cremas corporales vintage</strong>. Frente a los productos industriales cargados de químicos sintéticos, decidimos volver a las recetas de los antiguos cuadernos de botica: miel pura de abejas orgánica, mantecas vegetales vírgenes y macerados florales de época.
              </p>
              <p>
                Cada una de nuestras cremas se emulsiona artesanalmente en pequeños lotes para lograr esa consistencia rica y sedosa de pomada de tocador, que hidrata intensamente y deja en la piel una fragancia nostálgica y distinguida.
              </p>
            </div>

            {/* Core Values Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              {[
                'Miel pura de apicultura responsable',
                'Mantecas vegetales 100% vírgenes',
                'Emulsión sin químicos agresivos',
                'Diseño de empaques reciclables',
                'Elaboración artesanal en Colombia',
                'Compromiso con el bienestar real',
              ].map((val, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#4B3529] font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#B88752] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{val}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
