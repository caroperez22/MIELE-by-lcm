import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', contact: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contacto" className="py-20 bg-[#FFF9F0] border-b border-[#D6B779]/20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE6] border border-[#D6B779]/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B88752]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#4B3529]">
              Estamos para ayudarte
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#4B3529] tracking-tight">
            Contáctanos
          </h2>
          <p className="mt-3 text-base text-[#4B3529]/75 font-light">
            ¿Tienes dudas sobre los ingredientes de nuestras cremas corporales vintage o tu pedido? Escríbenos directamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct Info & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6B779]/30 shadow-xs space-y-6">
              <h3 className="font-serif text-2xl font-bold text-[#4B3529]">
                Canales de Atención Directa
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-[#4B3529]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] text-[#B88752] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">WhatsApp y Llamadas</span>
                    <span className="text-[#4B3529]/70">+57 312 456 7890</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] text-[#B88752] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Correo Electrónico</span>
                    <span className="text-[#4B3529]/70">contacto@mielebylcm.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] text-[#B88752] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Taller Artesanal & Origen</span>
                    <span className="text-[#4B3529]/70">Medellín, Antioquia — Colombia (Envíos nacionales)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] text-[#B88752] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Horario de Despachos</span>
                    <span className="text-[#4B3529]/70">Lunes a Sábado: 8:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-2">
                <a
                  href="https://wa.me/573124567890?text=Hola%20MIELE%20by%20lcm,%20tengo%20una%20consulta%20sobre%20sus%20cremas%20corporales%20vintage."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Hablar por WhatsApp con Asesora</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6B779]/30 shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#4B3529]">
                  Envíanos un Mensaje
                </h3>
                <p className="text-xs text-[#4B3529]/70 mt-1">
                  Respondemos en menos de 2 horas hábiles.
                </p>
              </div>

              {formSubmitted ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-xl font-bold text-emerald-900">
                    ¡Mensaje recibido con éxito!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Gracias por comunicarte con MIELE by lcm. Te responderemos muy pronto a tu contacto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#4B3529] mb-1">Tu Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Isabella Gómez"
                      className="w-full px-3 py-2.5 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl text-[#4B3529]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4B3529] mb-1">
                      Celular o Correo de Contacto
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact}
                      onChange={e => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="Ej. 310 123 4567 o isabella@ejemplo.com"
                      className="w-full px-3 py-2.5 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl text-[#4B3529]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4B3529] mb-1">¿Cómo podemos ayudarte?</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Cuéntanos qué crema corporal vintage te interesa, dudas sobre envíos o pedidos especiales..."
                      className="w-full px-3 py-2.5 bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl text-[#4B3529]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Mensaje</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
