'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getRewind, type RewindEntry } from '@/lib/api';
import {
  ArrowLeft,
  ArrowRight,
  Film,
  Trophy,
  Calendar,
  Crown,
} from 'lucide-react';

function getSeverityColor(avg: number): string {
  if (avg < 3.5) return '#22c55e';
  if (avg < 7) return '#f59e0b';
  return '#ef4444';
}

function rankBadge(rank: number): { emoji: string; label: string } {
  if (rank === 0) return { emoji: '👑', label: 'El más insufrible' };
  if (rank === 1) return { emoji: '🥈', label: 'Plata' };
  if (rank === 2) return { emoji: '🥉', label: 'Bronce' };
  return { emoji: `#${rank + 1}`, label: '' };
}

function PodiumCard({ entry, rank, height }: { entry: RewindEntry; rank: number; height: 'sm' | 'md' | 'lg' }) {
  const color = getSeverityColor(entry.avg_severity);
  const badge = rankBadge(rank);
  const sizeClass = height === 'lg' ? 'py-6 sm:py-7 sm:scale-105 sm:-translate-y-1' : height === 'md' ? 'py-5 sm:py-6' : 'py-4 sm:py-5';

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 px-3 sm:px-5 ${sizeClass} text-center`}>
      <div className="text-3xl sm:text-4xl mb-2">{badge.emoji}</div>
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-sm"
        style={{ backgroundColor: color }}
      >
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <p className="font-extrabold text-slate-800 text-sm sm:text-base truncate">{entry.name}</p>
      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
        {entry.incidents} {entry.incidents === 1 ? 'situación' : 'situaciones'}
      </p>
      <p className="text-sm sm:text-base font-extrabold mt-2" style={{ color }}>
        {entry.total_severity} pts
      </p>
      {badge.label && (
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-semibold uppercase tracking-wide">
          {badge.label}
        </p>
      )}
    </div>
  );
}

function RankingRow({ entry, rank, maxSeverity }: { entry: RewindEntry; rank: number; maxSeverity: number }) {
  const color = getSeverityColor(entry.avg_severity);
  const fillPct = maxSeverity > 0 ? (entry.total_severity / maxSeverity) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[11px] font-extrabold text-slate-500 shrink-0 border border-slate-100">
        {rank + 1}
      </div>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ backgroundColor: color }}
      >
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-800 truncate">{entry.name}</p>
        <p className="text-[11px] text-slate-400">
          {entry.incidents} {entry.incidents === 1 ? 'situación' : 'situaciones'} · {entry.avg_severity.toFixed(1)}/10 promedio
        </p>
      </div>
      <div className="w-20 sm:w-24 h-2 rounded-full bg-slate-100 overflow-hidden shrink-0">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${fillPct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs font-extrabold text-slate-600 w-10 text-right shrink-0">
        {entry.total_severity}
      </p>
    </div>
  );
}

function RewindContent() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<RewindEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRewind(year).then(({ data: result, error }) => {
      if (cancelled) return;
      setData(!error && result ? result : []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [year]);

  const totalIncidents = useMemo(() => data.reduce((s, d) => s + d.incidents, 0), [data]);
  const totalSeverity = useMemo(() => data.reduce((s, d) => s + d.total_severity, 0), [data]);
  const maxSeverity = data[0]?.total_severity ?? 0;
  const isCurrentYear = year === currentYear;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Year selector */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 shadow-sm"
          aria-label="Año anterior"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <Film className="w-4 h-4 text-orange-500" />
          <span className="font-extrabold text-slate-800 text-sm">Rewind</span>
          <span className="font-extrabold text-orange-500 text-base">{year}</span>
        </div>
        <button
          onClick={() => setYear((y) => y + 1)}
          disabled={isCurrentYear}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
          aria-label="Año siguiente"
        >
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 text-center tracking-tight mb-2">
        Los que más te sacaron de onda
      </h1>
      <p className="text-center text-sm text-slate-400 mb-6">
        Tu top anual, basado en cada bronca registrada
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-3xl bg-white border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-extrabold text-slate-700">Aún no hay broncas en {year}</h3>
          <p className="text-sm text-slate-400 mt-2">
            Cuando registres situaciones este año, aparecerán aquí en el rewind.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </Link>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { value: totalIncidents, label: 'Situaciones', color: 'text-orange-500', bg: 'bg-orange-50' },
              { value: totalSeverity, label: 'Puntos', color: 'text-rose-500', bg: 'bg-rose-50' },
              { value: data.length, label: 'Personas', color: 'text-indigo-500', bg: 'bg-indigo-50' },
              {
                value: data.length > 0 ? Math.round(totalIncidents / data.length) : 0,
                label: 'Por persona',
                color: 'text-emerald-500',
                bg: 'bg-emerald-50',
              },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 sm:p-4 text-center`}>
                <p className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Podium (top 3) - silver left, gold center, bronze right */}
          {data.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-6 items-end">
              <PodiumCard entry={data[1]} rank={1} height="sm" />
              <PodiumCard entry={data[0]} rank={0} height="lg" />
              <PodiumCard entry={data[2]} rank={2} height="md" />
            </div>
          )}

          {/* Fewer than 3 entries - flat layout */}
          {data.length < 3 && (
            <div className={`grid gap-3 mb-6 ${data.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {data.map((entry, idx) => (
                <PodiumCard key={entry.aggressor_id} entry={entry} rank={idx} height="md" />
              ))}
            </div>
          )}

          {/* Full ranking (skip the top 3 already shown on podium) */}
          {data.length > 3 && (
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Ranking completo</h3>
                <span className="ml-auto text-xs text-slate-400 font-medium">{data.length} personas</span>
              </div>
              <div className="space-y-2">
                {data.slice(3).map((entry, idx) => (
                  <RankingRow key={entry.aggressor_id} entry={entry} rank={idx + 3} maxSeverity={maxSeverity} />
                ))}
              </div>
            </section>
          )}

          {/* Top offender highlight card */}
          {data.length > 0 && (
            <section className="mt-6 p-5 rounded-3xl bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">MVP del año</p>
                  <p className="font-extrabold text-slate-800 text-base mt-0.5">{data[0].name}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Acumula <strong>{data[0].total_severity} puntos</strong> en {data[0].incidents}{' '}
                    {data[0].incidents === 1 ? 'situación' : 'situaciones'}, con promedio de{' '}
                    <strong>{data[0].avg_severity.toFixed(1)}/10</strong>. Se llevó la corona.
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al dashboard
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

export default function RewindPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-sm">
              <Film className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-base font-extrabold text-slate-800 leading-none">Brendanómetro · Rewind</h1>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-orange-500 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>
      </header>
      <RewindContent />
    </div>
  );
}
