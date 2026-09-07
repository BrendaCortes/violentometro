import { useAuth } from '@/context/AuthContext';
import { LogOut, Plus, Gauge } from 'lucide-react';

interface HeaderProps {
  onRegisterClick: () => void;
}

export function Header({ onRegisterClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-sm">
            <Gauge className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Violentómetro</h1>
            {user && (
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRegisterClick}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-200 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden xs:inline sm:inline">Registrar situación</span>
            <span className="xs:hidden sm:hidden">Registrar</span>
          </button>
          {user && (
            <button
              onClick={signOut}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-500"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
