import React, { useState } from 'react';
import { X, Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { adminLogin } from '../services/api.js';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('carolina.perez@iemanueljbetancur.edu.co');
  const [pin, setPin] = useState('miele2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminLogin(pin, email);
      sessionStorage.setItem('miele_admin_token', res.token);
      sessionStorage.setItem('miele_admin_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#D6B779]/40 p-6 sm:p-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#4B3529]/60 hover:text-[#4B3529] hover:bg-[#F5EFE6] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F5EFE6] text-[#B88752] flex items-center justify-center mx-auto border border-[#D6B779]/30">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#4B3529]">
            Acceso Administrativo
          </h3>
          <p className="text-xs text-[#4B3529]/70">
            Módulo privado para gestión de inventario, pedidos y ruleta MIELE.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4B3529] mb-1">
              Correo del Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#B88752] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4B3529] mb-1">
              PIN / Contraseña Maestra
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#B88752] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="PIN de acceso"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FFF9F0] border border-[#D6B779]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88752] text-[#4B3529]"
              />
            </div>
            <p className="text-[10px] text-[#4B3529]/60 mt-1">
              PIN predeterminado configurado: <code className="bg-[#F5EFE6] px-1.5 py-0.5 rounded text-[#B88752] font-semibold">miele2026</code>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#B88752] hover:bg-[#9A6A38] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
