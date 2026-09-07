/* eslint-disable react-hooks/set-state-in-effect -- syncing display level to prop is standard */
import { useEffect, useState } from 'react';

interface ThermometerProps {
  level: number; // 0-100
}

function getMood(level: number): { face: string; sweating: boolean; shaking: boolean; label: string } {
  if (level < 20) return { face: '😌', sweating: false, shaking: false, label: 'Todo tranqui' };
  if (level < 40) return { face: '🙂', sweating: false, shaking: false, label: 'Algo raro' };
  if (level < 60) return { face: '😟', sweating: true, shaking: false, label: 'Preocupado' };
  if (level < 80) return { face: '😰', sweating: true, shaking: true, label: 'Nervioso' };
  return { face: '😨', sweating: true, shaking: true, label: '¡Demasiado!' };
}

function getLiquidColor(level: number): string {
  if (level < 33) return '#22c55e';
  if (level < 66) return '#f59e0b';
  return '#ef4444';
}

export function Thermometer({ level }: ThermometerProps) {
  const [displayLevel, setDisplayLevel] = useState(0);
  const mood = getMood(level);
  const liquidColor = getLiquidColor(level);

  useEffect(() => {
    setDisplayLevel(level);
  }, [level]);

  return (
    <div className="flex flex-col items-center">
      {/* Face above thermometer */}
      <div className={`mb-2 text-4xl ${mood.shaking ? 'animate-shake' : ''}`}>
        {mood.face}
      </div>
      <p className="text-xs font-semibold text-slate-500 mb-2">{mood.label}</p>

      {/* Sweat drops */}
      {mood.sweating && (
        <>
          <div className="relative -mb-1 w-full h-0">
            <span className="absolute left-2 text-blue-400 text-lg sweat-drop" style={{ animationDelay: '0s' }}>💧</span>
            <span className="absolute right-2 text-blue-400 text-lg sweat-drop" style={{ animationDelay: '0.7s' }}>💧</span>
          </div>
        </>
      )}

      {/* Thermometer body */}
      <div className="relative flex flex-col items-center">
        {/* Tube */}
        <div className="relative w-10 h-44 sm:h-52 bg-slate-100 rounded-t-full rounded-b-xl border-2 border-slate-200 overflow-hidden shadow-inner">
          {/* Liquid */}
          <div
            className="thermometer-liquid absolute bottom-0 left-0 right-0 rounded-b-xl"
            style={{
              height: `${Math.max(4, displayLevel)}%`,
              background: `linear-gradient(to top, ${liquidColor}, ${liquidColor}dd)`,
              boxShadow: `0 0 12px ${liquidColor}66`,
            }}
          >
            {/* Bubbles */}
            {displayLevel > 10 && (
              <>
                <span className="bubble absolute bottom-2 left-1.5 w-1.5 h-1.5 rounded-full bg-white/40" style={{ animationDelay: '0s' }} />
                <span className="bubble absolute bottom-4 right-2 w-1 h-1 rounded-full bg-white/30" style={{ animationDelay: '0.8s' }} />
                <span className="bubble absolute bottom-1 right-3 w-2 h-2 rounded-full bg-white/20" style={{ animationDelay: '1.5s' }} />
              </>
            )}
          </div>

          {/* Tick marks */}
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute left-0 right-0 border-t border-slate-300/60"
              style={{ bottom: `${tick}%` }}
            />
          ))}
        </div>

        {/* Bulb */}
        <div
          className="w-14 h-14 rounded-full border-2 border-slate-200 -mt-1 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${liquidColor}, ${liquidColor}cc)`,
            boxShadow: `0 0 16px ${liquidColor}66, inset -3px -3px 8px rgba(0,0,0,0.15)`,
          }}
        >
          <div className="absolute top-1.5 left-2 w-3 h-3 rounded-full bg-white/40" />
        </div>

        {/* Level number */}
        <div className="mt-3 text-center">
          <span className="text-2xl font-extrabold" style={{ color: liquidColor }}>
            {Math.round(displayLevel)}
          </span>
          <span className="text-sm text-slate-400 font-semibold">/100</span>
        </div>
      </div>
    </div>
  );
}
