/* eslint-disable react-hooks/set-state-in-effect -- data fetching with useEffect is standard */
import { useState, useEffect, useCallback } from 'react';
import { AGGRESSION_TYPES, type AggressionType, type Aggressor } from '@/lib/types';
import { getAggressors, createAggressor, createSituation } from '@/lib/api';
import { X, UserPlus, Check, ChevronDown } from 'lucide-react';

interface RegisterSituationModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function RegisterSituationModal({ open, onClose, onSaved }: RegisterSituationModalProps) {
  const [aggressors, setAggressors] = useState<Aggressor[]>([]);
  const [selectedAggressor, setSelectedAggressor] = useState<string>('');
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [aggressionType, setAggressionType] = useState<AggressionType | ''>('');
  const [severity, setSeverity] = useState(5);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAggressors = useCallback(async () => {
    const { data } = await getAggressors();
    if (data) setAggressors(data);
  }, []);

  useEffect(() => {
    if (open) loadAggressors();
  }, [open, loadAggressors]);

  function reset() {
    setSelectedAggressor('');
    setShowNewPerson(false);
    setNewPersonName('');
    setAggressionType('');
    setSeverity(5);
    setDescription('');
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!aggressionType) {
      setError('Selecciona un tipo de agresión');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      let aggressorId = selectedAggressor || null;

      // Create new person if needed
      if (showNewPerson && newPersonName.trim()) {
        const { data: newAggressor, error: aggrError } = await createAggressor(newPersonName.trim());
        if (aggrError) throw new Error(aggrError);
        aggressorId = newAggressor!.id;
      }

      const { error: sitError } = await createSituation({
        aggressor_id: aggressorId,
        aggression_type: aggressionType,
        severity,
        description: description.trim() || null,
      });

      if (sitError) throw new Error(sitError);

      reset();
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up-fade"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-5 pb-4 border-b border-slate-100 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800">Registrar situación</h2>
            <button onClick={handleClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Aggression type */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2.5 block">Tipo de agresión</label>
            <div className="grid grid-cols-2 gap-2">
              {AGGRESSION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setAggressionType(type.value)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                    aggressionType === type.value
                      ? 'border-orange-400 bg-orange-50 text-slate-800 scale-[1.02]'
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <span className="text-lg">{type.emoji}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2.5 block">
              ¿Qué tan grave fue? <span className="text-orange-500 font-extrabold">{severity}/10</span>
            </label>
            <div className="relative pt-1">
              <input
                type="range"
                min={1}
                max={10}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #f59e0b 50%, #ef4444 100%)`,
                }}
              />
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 font-medium px-0.5">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Grave</span>
              </div>
            </div>
          </div>

          {/* Person */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2.5 block">Persona relacionada</label>
            {!showNewPerson ? (
              <div className="space-y-2">
                <div className="relative">
                  <select
                    value={selectedAggressor}
                    onChange={(e) => setSelectedAggressor(e.target.value)}
                    className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl border-2 border-slate-100 focus:border-orange-400 focus:outline-none text-slate-800 text-sm font-medium bg-white"
                  >
                    <option value="">Sin persona específica</option>
                    {aggressors.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  onClick={() => { setShowNewPerson(true); setSelectedAggressor(''); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-dashed border-orange-200 text-orange-500 text-sm font-semibold hover:bg-orange-50"
                >
                  <UserPlus className="w-4 h-4" />
                  Agregar nueva persona
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Nombre o alias"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-orange-400 focus:outline-none text-slate-800 text-sm font-medium placeholder:text-slate-300"
                />
                <button
                  onClick={() => { setShowNewPerson(false); setNewPersonName(''); }}
                  className="text-xs text-slate-400 font-medium hover:text-slate-600"
                >
                  Cancelar y elegir existente
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-500 mb-2.5 block">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuenta brevemente qué pasó..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-orange-400 focus:outline-none text-slate-800 text-sm font-medium placeholder:text-slate-300 resize-none"
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm font-medium px-4 py-3 rounded-2xl animate-pop-in">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving || !aggressionType}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar situación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
