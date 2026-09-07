import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export type SeverityLevel = 'green' | 'yellow' | 'red';

interface TrafficLightProps {
  level: SeverityLevel;
}

export function TrafficLight({ level }: TrafficLightProps) {
  const lights = [
    {
      key: 'green' as const,
      color: '#22c55e',
      bg: 'bg-green-500',
      icon: ShieldCheck,
      label: 'Tranquilo',
      desc: 'Situaciones leves',
    },
    {
      key: 'yellow' as const,
      color: '#f59e0b',
      bg: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Alerta',
      desc: 'Ojo, atención aquí',
    },
    {
      key: 'red' as const,
      color: '#ef4444',
      bg: 'bg-red-500',
      icon: AlertOctagon,
      label: 'Grave',
      desc: 'Situaciones serias',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 sm:w-28 bg-slate-800 rounded-3xl p-3 shadow-2xl border-4 border-slate-700">
        {/* Top cap */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-4 bg-slate-700 rounded-t-md" />

        {lights.map((light) => {
          const isActive = level === light.key;
          const Icon = light.icon;
          return (
            <div
              key={light.key}
              className={`
                relative w-full aspect-square rounded-full flex items-center justify-center
                mb-2 last:mb-0 transition-all duration-500
                ${isActive
                  ? `${light.bg} scale-110 shadow-lg`
                  : 'bg-slate-700/50 scale-95'
                }
              `}
              style={isActive ? {
                boxShadow: `0 0 24px 4px ${light.color}99, inset 0 -4px 8px rgba(0,0,0,0.2)`,
                animation: 'pulse-glow 1.5s ease-in-out infinite',
                color: light.color,
              } : undefined}
            >
              <Icon
                className={`w-7 h-7 transition-all duration-500 ${isActive ? 'text-white' : 'text-slate-600'}`}
                strokeWidth={2.5}
              />
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, white, transparent 50%)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Active label */}
      <div className="mt-3 text-center min-h-[44px]">
        {lights.map((light) => level === light.key && (
          <div key={light.key} className="animate-pop-in">
            <p className="font-bold text-sm" style={{ color: light.color }}>{light.label}</p>
            <p className="text-xs text-slate-400">{light.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
