import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Gift, AlertCircle, Copy, Check, ArrowRight, ShieldCheck, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { spinRoulette, fetchRouletteConfig, SpinResult } from '../services/api.js';
import type { RoulettePrize } from '../types.js';
import { useCart } from '../context/CartContext.js';

interface RouletteSectionProps {
  onGoToCatalog: () => void;
}

export const RouletteSection: React.FC<RouletteSectionProps> = ({ onGoToCatalog }) => {
  const { applyCouponCode, openCart } = useCart();

  const [prizes, setPrizes] = useState<RoulettePrize[]>([]);
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinError, setSpinError] = useState('');
  const [alreadySpunNotice, setAlreadySpunNotice] = useState<{ message: string; lastCoupon?: string; lastPrize?: string } | null>(null);
  const [currentResult, setCurrentResult] = useState<SpinResult | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [couponAppliedNotice, setCouponAppliedNotice] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef(0);

  // Load active prizes
  const loadPrizes = async () => {
    try {
      const config = await fetchRouletteConfig();
      setPrizes(config.activePrizes);
    } catch (err) {
      console.error('Error loading roulette prizes', err);
    }
  };

  useEffect(() => {
    loadPrizes();
  }, []);

  // Draw the wheel onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const numSectors = prizes.length;
    const arc = (2 * Math.PI) / numSectors;

    ctx.clearRect(0, 0, size, size);

    // Draw outer golden ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = '#D6B779';
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#B88752';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw sectors
    prizes.forEach((prize, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = prize.color || (i % 2 === 0 ? '#B88752' : '#FFF9F0');
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#D6B779';
      ctx.stroke();

      // Sector Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = prize.textColor || '#4B3529';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 2;

      // Draw prize label
      const text = prize.label;
      ctx.fillText(text, radius - 20, 4);

      ctx.restore();
    });

    // Draw decorative gold studs on perimeter
    for (let i = 0; i < numSectors * 2; i++) {
      const studAngle = (i * Math.PI) / numSectors;
      const studX = center + (radius + 5) * Math.cos(studAngle);
      const studY = center + (radius + 5) * Math.sin(studAngle);
      ctx.beginPath();
      ctx.arc(studX, studY, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#B88752';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw center gold hub
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFF9F0';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#D6B779';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#B88752';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Cormorant Garamond", serif';
    ctx.textAlign = 'center';
    ctx.fillText('MIELE', center, center + 4);

  }, [prizes]);

  // Handle spin action
  const handleSpin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSpinning) return;

    if (!customerIdentifier.trim()) {
      setSpinError('Por favor ingresa tu número de celular o correo para participar.');
      return;
    }

    setSpinError('');
    setAlreadySpunNotice(null);
    setCurrentResult(null);
    setCouponAppliedNotice(false);

    try {
      setIsSpinning(true);

      // Call server authoritative endpoint
      const result = await spinRoulette(customerIdentifier.trim());

      // Target calculation:
      // The pointer is at the TOP (270 degrees or 3*PI/2)
      // Each sector spans (360 / totalSectors) degrees
      const sectorAngle = 360 / result.totalSectors;
      // To land targetIndex under the top pointer:
      // Top pointer = 270 deg.
      // Sector center = targetIndex * sectorAngle + sectorAngle / 2
      // Desired final rotation:
      const targetCenterAngle = result.targetIndex * sectorAngle + sectorAngle / 2;
      const baseSpins = 360 * 5; // 5 full rotations for dramatic suspense
      // Canvas coordinate offset: 270 - targetCenterAngle
      const finalAngle = baseSpins + (270 - targetCenterAngle) + (Math.random() * 8 - 4);

      setRotationAngle(finalAngle);
      currentAngleRef.current = finalAngle;

      // Wait for spin animation (4.5s) to complete before showing result
      setTimeout(() => {
        setIsSpinning(false);
        setCurrentResult(result);

        // Confetti celebration if won!
        if (result.prize.type !== 'no_prize') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#D6B779', '#B88752', '#4B3529', '#FFF9F0', '#F5EFE6'],
          });
        }
      }, 4500);

    } catch (err: any) {
      setIsSpinning(false);
      if (err.alreadySpun) {
        setAlreadySpunNotice({
          message: err.message,
          lastCoupon: err.lastCoupon,
          lastPrize: err.lastPrize,
        });
      } else {
        setSpinError(err.message || 'No fue posible girar la ruleta. Intenta nuevamente.');
      }
    }
  };

  const handleCopyCoupon = () => {
    if (currentResult?.couponCode) {
      navigator.clipboard.writeText(currentResult.couponCode);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  const handleApplyToCart = async () => {
    if (currentResult?.couponCode) {
      await applyCouponCode(currentResult.couponCode);
      setCouponAppliedNotice(true);
      openCart();
    }
  };

  return (
    <section id="ruleta" className="py-20 bg-gradient-to-b from-[#FFF9F0] via-[#F5EFE6] to-[#FFF9F0] border-b border-[#D6B779]/20 scroll-mt-20 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D6B779]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF9F0] border border-[#D6B779]/40 mb-3 shadow-2xs">
            <Gift className="w-3.5 h-3.5 text-[#B88752]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#4B3529]">
              Dinámica Promocional Exclusiva
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#4B3529] tracking-tight">
            La Ruleta MIELE
          </h2>
          <p className="mt-3 text-base text-[#4B3529]/75 font-light">
            Gira y descubre tu regalo: ¡puedes ganar una crema corporal vintage de botica gratis, 
            descuentos de hasta el 15% o envío nacional totalmente gratis!
          </p>
        </div>

        {/* Roulette Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Wheel Interactive Area (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative p-4 sm:p-8 bg-white/80 backdrop-blur-xs rounded-full shadow-2xl border-4 border-[#D6B779]/40">
              
              {/* Pointer Marker at the top */}
              <div className="absolute top-2 sm:top-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                <div className="w-5 h-7 bg-gradient-to-b from-[#4B3529] to-[#B88752] rounded-t-sm shadow-md clip-pointer" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
              </div>

              {/* Canvas Wheel with CSS Rotation */}
              <div
                className="relative rounded-full overflow-hidden transition-transform ease-out"
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transitionDuration: isSpinning ? '4500ms' : '0ms',
                  transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={380}
                  className="w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] block"
                />
              </div>

            </div>

            <p className="mt-4 text-[11px] text-[#4B3529]/60 font-medium text-center flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B88752]" />
              Resultado auditado y validado en servidor • 1 giro por participante cada 24 horas
            </p>
          </div>

          {/* Form and Result Details Area (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Participation Input Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6B779]/40 shadow-lg space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88752] block">
                  Paso 1 de 1
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#4B3529]">
                  Ingresa tus datos para girar
                </h3>
                <p className="text-xs text-[#4B3529]/70 mt-1">
                  Tu contacto nos permite registrar tu premio y asignarte un código de cupón personal para tu orden.
                </p>
              </div>

              <form onSubmit={handleSpin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4B3529] mb-1">
                    Número de Celular o Correo Electrónico
                  </label>
                  <input
                    type="text"
                    disabled={isSpinning}
                    value={customerIdentifier}
                    onChange={e => setCustomerIdentifier(e.target.value)}
                    placeholder="Ej. 312 456 7890 o tu@email.com"
                    className="w-full px-4 py-3 text-sm bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529] placeholder-[#4B3529]/40"
                  />
                </div>

                {spinError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{spinError}</span>
                  </div>
                )}

                {alreadySpunNotice && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>{alreadySpunNotice.message}</span>
                    </div>
                    {alreadySpunNotice.lastCoupon && (
                      <p className="text-[11px] text-[#4B3529]">
                        Tu cupón de hoy es: <strong className="text-[#B88752] text-xs">{alreadySpunNotice.lastCoupon}</strong> ({alreadySpunNotice.lastPrize})
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSpinning}
                  className="w-full py-4 px-6 rounded-2xl bg-[#B88752] hover:bg-[#9A6A38] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSpinning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>¡La ruleta está girando...!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>¡Girar la Ruleta Ahora!</span>
                    </>
                  )}
                </button>
              </form>

              {/* Prize catalog list preview */}
              <div className="pt-4 border-t border-[#D6B779]/20">
                <span className="text-[11px] font-bold text-[#4B3529]/70 uppercase tracking-wider block mb-2">
                  Premios disponibles hoy:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-[#4B3529]">
                  {prizes.slice(0, 4).map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1.5 bg-[#FFF9F0] px-2.5 py-1 rounded-md border border-[#D6B779]/20 text-[11px]">
                      <Gift className="w-3 h-3 text-[#B88752]" />
                      <span className="truncate">{p.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Winning Result Card */}
            {currentResult && (
              <div className="bg-gradient-to-br from-[#FFF9F0] to-[#F5EFE6] p-6 rounded-3xl border-2 border-[#D6B779] shadow-xl space-y-4 animate-scaleUp">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#B88752] text-white flex items-center justify-center shadow-md">
                    <Trophy className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88752] block">
                      Resultado de tu Giro
                    </span>
                    <h4 className="font-serif text-2xl font-bold text-[#4B3529]">
                      {currentResult.prize.label}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-[#4B3529]/80 leading-relaxed font-medium">
                  {currentResult.message}
                </p>

                {currentResult.couponCode && (
                  <div className="bg-white p-3.5 rounded-2xl border border-[#D6B779]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#4B3529]/60 font-semibold uppercase block">
                        Tu Código Exclusivo:
                      </span>
                      <span className="font-mono text-base font-bold text-[#B88752] tracking-wider">
                        {currentResult.couponCode}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCoupon}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F5EFE6] hover:bg-[#EAD9C0] text-[#4B3529] text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {copiedCoupon ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#B88752]" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {currentResult.couponCode && (
                    <button
                      onClick={handleApplyToCart}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{couponAppliedNotice ? '¡Aplicado a Bolsa!' : 'Aplicar a mi Bolsa'}</span>
                    </button>
                  )}

                  <button
                    onClick={onGoToCatalog}
                    className="w-full py-2.5 px-3 rounded-xl border border-[#D6B779] bg-white hover:bg-[#F5EFE6] text-[#4B3529] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Ir al Catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B88752]" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
