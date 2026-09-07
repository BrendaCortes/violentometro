'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { TrafficLight, type SeverityLevel } from '@/components/TrafficLight';
import { Thermometer } from '@/components/Thermometer';
import { RegisterSituationModal } from '@/components/RegisterSituationModal';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { PeopleSection } from '@/components/PeopleSection';
import { ChartsSection } from '@/components/ChartsSection';
import { HistorySection } from '@/components/HistorySection';
import { Heart, Calendar, Film, ArrowRight } from 'lucide-react';
import { getSituations } from '@/lib/api';
import { getCurrentWeek, isInWeek } from '@/lib/week';
import type { Situation } from '@/lib/types';

function AppContent() {
  const { user } = useAuth();
  const [situations, setSituations] = useState<Situation[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [weekRange, setWeekRange] = useState(() => getCurrentWeek());

  useEffect(() => {
    const interval = setInterval(() => setWeekRange(getCurrentWeek()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const loadSituations = useCallback(async () => {
    const { data, error } = await getSituations();
    if (!error && data) setSituations(data);
  }, []);

  useEffect(() => {
    loadSituations();
  }, [refreshKey, loadSituations]);

  useEffect(() => {
    if (user && loginPromptOpen) {
      const timer = setTimeout(() => {
        setLoginPromptOpen(false);
        setRegisterOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, loginPromptOpen]);

  function handleRegisterClick() {
    if (user) setRegisterOpen(true);
    else setLoginPromptOpen(true);
  }

  const weeklySituations = useMemo(
    () => situations.filter((s) => isInWeek(s.created_at, weekRange)),
    [situations, weekRange]
  );

  const totalSeverity = weeklySituations.reduce((sum, s) => sum + s.severity, 0);
  const level = Math.min(100, totalSeverity);
  const severityLevel: SeverityLevel = level < 33 ? 'green' : level < 66 ? 'yellow' : 'red';
  const isDecember = new Date().getMonth() === 11;

  const levelMessage = useMemo(() => {
    if (weeklySituations.length === 0) return { title: 'Aún sin broncas', subtitle: 'Vamos empezando la semana', color: '#22c55e' };
    if (severityLevel === 'green') return { title: 'Nivel tranquilo', subtitle: 'Ando vibrandoo alto mi compa', color: '#22c55e' };
    if (severityLevel === 'yellow') return { title: 'Nivel de alerta', subtitle: 'Eh, no se pase de verga mi compa', color: '#f59e0b' };
    return { title: 'Nivel de emergencia', subtitle: 'Brenda esta emputadisima, cuidese mucho carnal', color: '#ef4444' };
  }, [weeklySituations.length, severityLevel]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onRegisterClick={handleRegisterClick} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-[11px] font-semibold text-slate-500 mb-3 shadow-sm">
          <Calendar className="w-3 h-3" />
          Semana {weekRange.label}
        </div>
        <div className='flex items-center justify-center mb-5'>
          <h2 className="text-3xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            ¿Cuánto has molestado a <span className="text-orange-500">Brenda esta semana?</span>
          </h2>
        </div>

        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-8 mb-6 overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-orange-50/60 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-emerald-50/60 blur-3xl pointer-events-none" />

          <div className="relative text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${levelMessage.color}15`, color: levelMessage.color }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: levelMessage.color }} />
              {levelMessage.title}
            </div>
            <p className="text-xs text-slate-400 mt-2">{levelMessage.subtitle}</p>
          </div>

          <div className="relative flex items-center justify-center gap-12 sm:gap-28">
            <TrafficLight level={severityLevel} />
            <div className="h-44 sm:h-56 w-px bg-slate-100" />
            <Thermometer level={level} />
          </div>

          <div className="relative mt-7 flex items-center justify-center">
            <button
              onClick={handleRegisterClick}
              className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
            >
              <span className="text-xl leading-none group-hover:rotate-90 transition-transform">+</span>
              Registrar situación
            </button>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: weeklySituations.length, label: 'Situaciones', color: 'text-orange-500', bg: 'bg-orange-50' },
            { value: totalSeverity, label: 'Puntos', color: 'text-rose-500', bg: 'bg-rose-50' },
            { value: new Set(weeklySituations.map((s) => s.aggressor_id).filter(Boolean)).size, label: 'Personas', color: 'text-indigo-500', bg: 'bg-indigo-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 sm:p-4 text-center`}>
              <p className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <PeopleSection
              refreshKey={refreshKey}
              onSelectPerson={setSelectedPersonId}
              selectedPersonId={selectedPersonId}
            />
            <HistorySection
              refreshKey={refreshKey}
              selectedPersonId={selectedPersonId}
              onClearFilter={() => setSelectedPersonId(null)}
              onChanged={() => setRefreshKey((k) => k + 1)}
            />
          </div>
          <ChartsSection refreshKey={refreshKey} selectedPersonId={selectedPersonId} />
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-slate-100/70 flex items-start gap-3 max-w-2xl mx-auto">
          <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-600">Un recordatorio amable:</strong> si algo te incomoda o te hace sentir en peligro, tu sensación es válida. Considera hablar con alguien de confianza o buscar ayuda profesional.
          </p>
        </div>

        {isDecember && (
          <div className="mt-6 flex justify-center">
            <Link
              href="/rewind"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
            >
              <Film className="w-4 h-4" />
              Rewind del año
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </main>

      <footer className="text-center pb-8 pt-2 text-xs text-slate-400">
        Tu información es privada · Cuídate mucho
      </footer>

      {user ? (
        <RegisterSituationModal
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      ) : (
        <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
