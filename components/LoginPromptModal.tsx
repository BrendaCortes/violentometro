import { useAuth } from '@/context/AuthContext';
import { LogIn, X, Shield } from 'lucide-react';
import { useState } from 'react';

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginPromptModal({ open, onClose }: LoginPromptModalProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
    } else {
      onClose();
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-slide-up-fade"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-extrabold text-slate-800">Iniciar sesión</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-5">
          Para registrar situaciones necesitas iniciar sesión.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-400 focus:outline-none text-slate-800 text-sm font-medium placeholder:text-slate-300"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-400 focus:outline-none text-slate-800 text-sm font-medium placeholder:text-slate-300"
          />

          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs font-medium px-4 py-2.5 rounded-2xl animate-pop-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
