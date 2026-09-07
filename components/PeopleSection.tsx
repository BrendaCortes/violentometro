/* eslint-disable react-hooks/set-state-in-effect -- data fetching with useEffect is standard */
import { useState, useEffect, useCallback } from 'react';
import type { Aggressor, Situation } from '@/lib/types';
import { getAggressors, getSituations } from '@/lib/api';
import { Users, ChevronRight, X } from 'lucide-react';

interface PeopleSectionProps {
  refreshKey: number;
  onSelectPerson: (aggressorId: string | null) => void;
  selectedPersonId: string | null;
}

interface AggressorWithStats extends Aggressor {
  count: number;
  totalSeverity: number;
  avgSeverity: number;
}

function getLevelColor(avg: number): string {
  if (avg < 3.5) return '#22c55e';
  if (avg < 7) return '#f59e0b';
  return '#ef4444';
}

export function PeopleSection({ refreshKey, onSelectPerson, selectedPersonId }: PeopleSectionProps) {
  const [aggressors, setAggressors] = useState<AggressorWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [aggrResult, sitResult] = await Promise.all([getAggressors(), getSituations()]);

    if (!aggrResult.data || !sitResult.data) {
      setAggressors([]);
      setLoading(false);
      return;
    }

    const stats: AggressorWithStats[] = aggrResult.data.map((a: Aggressor) => {
      const situations = sitResult.data!.filter((s: Situation) => s.aggressor_id === a.id);
      const totalSeverity = situations.reduce((sum: number, s: Situation) => sum + s.severity, 0);
      return {
        ...a,
        count: situations.length,
        totalSeverity,
        avgSeverity: situations.length > 0 ? totalSeverity / situations.length : 0,
      };
    });

    setAggressors(stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [refreshKey, loadData]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Personas</h3>
        </div>
        {selectedPersonId && (
          <button
            onClick={() => onSelectPerson(null)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Quitar filtro
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-slate-50 animate-pulse" />
          ))}
        </div>
      ) : aggressors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">Aún no has registrado personas.</p>
          <p className="text-xs text-slate-300 mt-1">Aparecerán aquí al registrar situaciones.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {aggressors.map((a) => {
            const isSelected = selectedPersonId === a.id;
            const color = getLevelColor(a.avgSeverity);
            const fillPercent = Math.min(100, (a.avgSeverity / 10) * 100);

            return (
              <button
                key={a.id}
                onClick={() => onSelectPerson(isSelected ? null : a.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {a.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{a.name}</p>
                  <p className="text-xs text-slate-400">
                    {a.count} {a.count === 1 ? 'situación' : 'situaciones'}
                    {a.count > 0 && ` · promedio ${a.avgSeverity.toFixed(1)}/10`}
                  </p>
                </div>

                {/* Level bar */}
                <div className="w-12 h-2 rounded-full bg-slate-100 overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${fillPercent}%`, backgroundColor: color }}
                  />
                </div>

                <ChevronRight className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
