/* eslint-disable react-hooks/set-state-in-effect -- data fetching with useEffect is standard */
import { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { getSituations, getAggressors } from '@/lib/api';
import { AGGRESSION_TYPES } from '@/lib/types';
import type { Situation, AggressionType } from '@/lib/types';

interface ChartsSectionProps {
  refreshKey: number;
  selectedPersonId: string | null;
}

type ChartTab = 'evolution' | 'types' | 'people';

export function ChartsSection({ refreshKey, selectedPersonId }: ChartsSectionProps) {
  const [tab, setTab] = useState<ChartTab>('evolution');
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await getSituations(selectedPersonId ?? undefined);
    setSituations(data ?? []);
    setLoading(false);
  }, [selectedPersonId]);

  useEffect(() => {
    loadData();
  }, [refreshKey, selectedPersonId, loadData]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
          <BarChart3 className="w-4.5 h-4.5 text-emerald-500" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">Gráfica</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 bg-slate-100 rounded-2xl p-1">
        <TabButton active={tab === 'evolution'} onClick={() => setTab('evolution')} icon={TrendingUp} label="Evolución" />
        <TabButton active={tab === 'types'} onClick={() => setTab('types')} icon={PieChart} label="Tipos" />
        <TabButton active={tab === 'people'} onClick={() => setTab('people')} icon={BarChart3} label="Personas" />
      </div>

      {loading ? (
        <div className="h-40 rounded-2xl bg-slate-50 animate-pulse" />
      ) : situations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-slate-400">Sin datos para mostrar aún.</p>
          <p className="text-xs text-slate-300 mt-1">Registra situaciones para ver la gráfica.</p>
        </div>
      ) : (
        <>
          {tab === 'evolution' && <EvolutionChart situations={situations} />}
          {tab === 'types' && <TypesChart situations={situations} />}
          {tab === 'people' && <PeopleChart situations={situations} />}
        </>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
        active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function EvolutionChart({ situations }: { situations: Situation[] }) {
  // Group by date and accumulate severity
  const byDate = new Map<string, { count: number; totalSeverity: number }>();
  situations.forEach((s) => {
    const date = new Date(s.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' });
    const existing = byDate.get(date) ?? { count: 0, totalSeverity: 0 };
    existing.count += 1;
    existing.totalSeverity += s.severity;
    byDate.set(date, existing);
  });

  const dates = Array.from(byDate.keys());
  const maxCount = Math.max(...dates.map((d) => byDate.get(d)!.count), 1);

  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 h-36 mb-2">
        {dates.slice(-12).map((date) => {
          const data = byDate.get(date)!;
          const height = (data.count / maxCount) * 100;
          const avgSev = data.totalSeverity / data.count;
          const color = avgSev < 3.5 ? '#22c55e' : avgSev < 7 ? '#f59e0b' : '#ef4444';
          return (
            <div key={date} className="flex-1 flex flex-col items-center justify-end gap-1 group">
              <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {data.count}
              </span>
              <div
                className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                style={{
                  height: `${Math.max(4, height)}%`,
                  background: `linear-gradient(to top, ${color}, ${color}aa)`,
                  minHeight: '6px',
                }}
              />
              <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{date}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 text-center">Incidentes por día</p>
    </div>
  );
}

function TypesChart({ situations }: { situations: Situation[] }) {
  const counts = new Map<AggressionType, number>();
  situations.forEach((s) => {
    counts.set(s.aggression_type as AggressionType, (counts.get(s.aggression_type as AggressionType) ?? 0) + 1);
  });

  const total = situations.length;
  const sorted = AGGRESSION_TYPES
    .map((t) => ({ ...t, count: counts.get(t.value) ?? 0 }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-2.5">
      {sorted.map((t) => {
        const pct = (t.count / total) * 100;
        return (
          <div key={t.value}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span>{t.emoji}</span> {t.label}
              </span>
              <span className="text-xs font-bold text-slate-400">{t.count}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: t.color }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-400 text-center pt-1">Distribución por tipo de agresión</p>
    </div>
  );
}

function PeopleChart({ situations }: { situations: Situation[] }) {
  const [aggressorNames, setAggressorNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const ids = [...new Set(situations.map((s) => s.aggressor_id).filter(Boolean))] as string[];
    if (ids.length === 0) return;
    getAggressors().then(({ data }) => {
      if (data) {
        const filtered = data.filter((a) => ids.includes(a.id));
        const map = new Map<string, string>();
        filtered.forEach((a) => map.set(a.id, a.name));
        setAggressorNames(map);
      }
    });
  }, [situations]);

  const counts = new Map<string, number>();
  situations.forEach((s) => {
    if (s.aggressor_id) {
      counts.set(s.aggressor_id, (counts.get(s.aggressor_id) ?? 0) + 1);
    }
  });

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (sorted.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-8">Sin personas registradas</p>;
  }

  const maxCount = Math.max(...sorted.map(([, c]) => c), 1);

  return (
    <div className="space-y-2.5">
      {sorted.map(([id, count]) => {
        const name = aggressorNames.get(id) ?? 'Desconocido';
        const pct = (count / maxCount) * 100;
        return (
          <div key={id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-600 truncate">{name}</span>
              <span className="text-xs font-bold text-slate-400">{count}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-400 text-center pt-1">Incidentes por persona</p>
    </div>
  );
}
