'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { TrafficLight, type SeverityLevel } from '@/components/TrafficLight';
import { Thermometer } from '@/components/Thermometer';
import { RegisterSituationModal } from '@/components/RegisterSituationModal';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { PeopleSection } from '@/components/PeopleSection';
import { ChartsSection } from '@/components/ChartsSection';
import { HistorySection } from '@/components/HistorySection';
import { Shield, Heart, LockKeyhole, Sparkles, Info } from 'lucide-react';
import { getSituations } from '@/lib/api';
import type { Situation } from '@/lib/types';

function AppContent() {
  const { user, loading } = useAuth();
  const [situations, setSituations] = useState<Situation[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const loadSituations = useCallback(async () => {
    const { data, error } = await getSituations();
    if (!error && data) setSituations(data);
  }, []);

  useEffect(() => {
    if (user) {
      loadSituations();
    } else {
      setSituations([]);
    }
  }, [user, refreshKey, loadSituations]);

  useEffect(() => {
    if (user && loginPromptOpen) {
      // Delay state updates to avoid cascading render in same effect
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

  const totalSeverity = situations.reduce((sum, s) => sum + s.severity, 0);
  const level = Math.min(100, totalSeverity * 2.5);
  const severityLevel: SeverityLevel = level < 33 ? 'green' : level < 66 ? 'yellow' : 'red';

  const levelMessage = useMemo(() => {
    if (situations.length === 0) return { title: 'Tu medidor está en calma', subtitle: 'Registra una situación para comenzar a medir', color: '#22c55e' };
    if (severityLevel === 'green') return { title: 'Nivel tranquilo', subtitle: 'Pero cada sensación importa', color: '#22c55e' };
    if (severityLevel === 'yellow') return { title: 'Nivel de alerta', subtitle: 'Tu bienestar merece atención', color: '#f59e0b' };
    return { title: 'Nivel elevado', subtitle: 'Considera buscar apoyo y acompañamiento', color: '#ef4444' };
  }, [situations.length, severityLevel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/60 to-rose-50/60">
          <Header onRegisterClick={handleRegisterClick} />
          <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <section className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-orange-100 text-orange-600 text-xs font-bold mb-5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Tu bienestar, a tu manera
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
                ¿Cómo está tu<br /><span className="text-orange-500">temperatura?</span>
              </h2>
              <p className="text-slate-500 mt-4 text-base sm:text-lg leading-relaxed">
                Un espacio privado para identificar, registrar y entender esas situaciones que te hacen sentir mal.
              </p>
              <button
                onClick={handleRegisterClick}
                className="mt-7 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Comenzar mi registro
              </button>
            </section>

            {/* Preview meter */}
            <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-10 sm:gap-20">
                <TrafficLight level="green" />
                <div className="h-32 w-px bg-slate-100" />
                <Thermometer level={18} />
              </div>
              <div className="mt-8 p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-700 leading-relaxed">
                  <strong>Recuerda:</strong> esta herramienta no define lo que viviste. Solo te ayuda a ponerle nombre y observar patrones. Tú tienes el control.
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
              {[
                { icon: LockKeyhole, title: 'Privado', text: 'Tus registros son solo tuyos', color: 'bg-emerald-50 text-emerald-600' },
                { icon: Heart, title: 'A tu ritmo', text: 'Sin juicios ni prisas', color: 'bg-rose-50 text-rose-500' },
                { icon: Shield, title: 'Con propósito', text: 'Entender para cuidarte', color: 'bg-sky-50 text-sky-600' },
              ].map(({ icon: Icon, title, text, color }) => (
                <div key={title} className="bg-white/70 rounded-2xl p-4 text-center border border-white">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{text}</p>
                </div>
              ))}
            </section>
          </main>
          <footer className="text-center pb-8 text-xs text-slate-400">
            Una herramienta de autoconocimiento y cuidado personal
          </footer>
        </div>
        <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onRegisterClick={handleRegisterClick} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Welcome */}
        <div className="mb-6 animate-slide-up-fade">
          <p className="text-xs font-semibold text-orange-500 mb-1">Tu espacio personal</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Hola, <span className="text-orange-500">tú.</span> ¿Cómo te sientes hoy?
          </h2>
        </div>

        {/* Main meter card */}
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

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: situations.length, label: 'Situaciones', color: 'text-orange-500', bg: 'bg-orange-50' },
            { value: totalSeverity, label: 'Puntos', color: 'text-rose-500', bg: 'bg-rose-50' },
            { value: new Set(situations.map((s) => s.aggressor_id).filter(Boolean)).size, label: 'Personas', color: 'text-indigo-500', bg: 'bg-indigo-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 sm:p-4 text-center`}>
              <p className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Desktop 2-column layout */}
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
            />
          </div>
          <ChartsSection refreshKey={refreshKey} selectedPersonId={selectedPersonId} />
        </div>

        {/* Support note */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-100/70 flex items-start gap-3 max-w-2xl mx-auto">
          <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-600">Un recordatorio amable:</strong> si algo te incomoda o te hace sentir en peligro, tu sensación es válida. Considera hablar con alguien de confianza o buscar ayuda profesional.
          </p>
        </div>
      </main>

      <footer className="text-center pb-8 pt-2 text-xs text-slate-400">
        Tu información es privada · Cuídate mucho
      </footer>

      <RegisterSituationModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
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
