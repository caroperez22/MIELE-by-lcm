import React from 'react';
import { Droplets, Sparkles, HeartHandshake, ShieldCheck, Leaf, Clock } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: <Leaf className="w-6 h-6 text-[#B88752]" />,
      title: '100% Ingredientes Puros',
      description: 'Sin parabenos, sulfatos ni derivados del petróleo. Mantecas orgánicas de karité, cacao y mango prensadas en frío.',
    },
    {
      icon: <Clock className="w-6 h-6 text-[#B88752]" />,
      title: 'Hidratación Continua 48h',
      description: 'Fórmula enriquecida con miel pura que crea una película protectora invisible para sellar la humedad.',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#B88752]" />,
      title: 'Artesanal y Cruelty Free',
      description: 'Elaboradas a mano en pequeños lotes en Colombia con comercio justo y cero testeo en animales.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#B88752]" />,
      title: 'Apta para Pieles Sensibles',
      description: 'Textura sedosa no grasa que calma irritaciones, alivia zonas resecas y mejora la elasticidad cutánea.',
    },
  ];

  return (
    <section id="beneficios" className="py-20 bg-[#FFF9F0] border-b border-[#D6B779]/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE6] border border-[#D6B779]/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B88752]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#4B3529]">
              Filosofía de Bienestar
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#4B3529] tracking-tight">
            ¿Por qué elegir MIELE by lcm?
          </h2>
          <p className="mt-3 text-base text-[#4B3529]/75 font-light">
            Cada crema corporal vintage es un ritual de botica y autocuidado pensado para consentir tu piel con lo más noble de la naturaleza.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-[#D6B779]/30 shadow-xs hover:shadow-lg hover:border-[#B88752]/50 transition-all text-center sm:text-left space-y-4 flex flex-col justify-between"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FFF9F0] border border-[#D6B779]/30 flex items-center justify-center mx-auto sm:mx-0 shadow-2xs">
                {item.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-[#4B3529]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B3529]/70 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
              <div className="pt-2 border-t border-[#D6B779]/15">
                <span className="text-[11px] font-semibold text-[#B88752] uppercase tracking-wider">
                  Estándar MIELE
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
