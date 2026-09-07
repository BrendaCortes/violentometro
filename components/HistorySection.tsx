/* eslint-disable react-hooks/set-state-in-effect -- data fetching with useEffect is standard */
import { useState, useEffect, useCallback } from 'react';
import { AGGRESSION_TYPES } from '@/lib/types';
import type { Situation, Aggressor } from '@/lib/types';
import { getSituations, getAggressors, deleteSituation } from '@/lib/api';
import { History, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HistorySectionProps {
  refreshKey: number;
  selectedPersonId: string | null;
  onClearFilter: () => void;
  onChanged: () => void;
}

function getSeverityColor(sev: number): string {
  if (sev < 4) return '#22c55e';
  if (sev < 7) return '#f59e0b';
  return '#ef4444';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function HistorySection({ refreshKey, selectedPersonId, onClearFilter, onChanged }: HistorySectionProps) {
  const { user } = useAuth();
  const [situations, setSituations] = useState<Situation[]>([]);
  const [aggressors, setAggressors] = useState<Map<string, Aggressor>>(new Map());
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [sitResult, aggrResult] = await Promise.all([
      getSituations(selectedPersonId ?? undefined),
      getAggressors(),
    ]);

    const map = new Map<string, Aggressor>();
    if (aggrResult.data) {
      aggrResult.data.forEach((a: Aggressor) => map.set(a.id, a));
    }
    setAggressors(map);
    setSituations(sitResult.data ?? []);
    setLoading(false);
  }, [selectedPersonId]);

  useEffect(() => {
    loadData();
  }, [refreshKey, selectedPersonId, loadData]);

  // Auto-cancel pending delete after 3s if user doesn't confirm.
  useEffect(() => {
    if (!pendingDeleteId) return;
    const t = setTimeout(() => setPendingDeleteId(null), 3000);
    return () => clearTimeout(t);
  }, [pendingDeleteId]);

  const handleDelete = useCallback(async (id: string) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id);
      return;
    }
    setPendingDeleteId(null);
    await deleteSituation(id);
    loadData();
    onChanged();
  }, [pendingDeleteId, loadData, onChanged]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <History className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Historial</h3>
          {selectedPersonId && (
            <button
              onClick={onClearFilter}
              className="flex items-center gap-1 text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full"
            >
              Filtrado
            </button>
          )}
        </div>
        {situations.length > 0 && (
          <span className="text-xs text-slate-400 font-medium">{situations.length} registros</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-50 animate-pulse" />
          ))}
        </div>
      ) : situations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">No hay situaciones registradas{selectedPersonId ? ' para esta persona' : ''}.</p>
          <p className="text-xs text-slate-300 mt-1">Toca &ldquo;Registrar situación&rdquo; para empezar.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {situations.map((s) => {
            const type = AGGRESSION_TYPES.find((t) => t.value === s.aggression_type);
            const aggressor = s.aggressor_id ? aggressors.get(s.aggressor_id) : null;
            const color = getSeverityColor(s.severity);

            return (
              <div
                key={s.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-colors animate-slide-up-fade"
              >
                {/* Type badge */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${type?.color}15` }}
                >
                  {type?.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700">{type?.label}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: color }}
                    >
                      {s.severity}/10
                    </span>
                    {aggressor && (
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        · {aggressor.name}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                  )}
                  <p className="text-[10px] text-slate-300 mt-1">{formatDate(s.created_at)}</p>
                </div>

                {/* Delete (two-step confirm) */}
                {user && (
                  pendingDeleteId === s.id ? (
                    <div className="flex items-center gap-1 shrink-0 animate-pop-in">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-bold hover:bg-rose-600 shadow-sm"
                        title="Confirmar borrado"
                      >
                        Borrar
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200"
                        title="Cancelar"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 bg-slate-100 shrink-0 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
