import React, { useState, useEffect } from 'react';
import { Activity, ChevronUp, ChevronDown, CheckCircle2, Shield, Trash2 } from 'lucide-react';
import { TelemetryEvent } from '../types';

interface TelemetryDrawerProps {
  events: TelemetryEvent[];
  onClear: () => void;
  sessionId: string;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  events,
  onClear,
  sessionId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-pulse when new event arrives
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (events.length > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [events.length]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-3 pb-2 pointer-events-none">
      <div className="bg-zinc-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-zinc-700/60 pointer-events-auto transition-all overflow-hidden">
        {/* Header Toggle Bar */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-zinc-800/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2.5 w-2.5`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${pulse ? 'scale-150' : ''}`} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eventos en Firestore ({events.length})</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              Zero-PII
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-zinc-400 font-semibold">
            <span>{isOpen ? 'Ocultar' : 'Ver telemetría'}</span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Collapsible Event Log */}
        {isOpen && (
          <div className="px-3.5 pb-3 max-h-60 overflow-y-auto border-t border-zinc-800 text-xs">
            <div className="flex items-center justify-between py-2 text-[11px] text-zinc-400 border-b border-zinc-800/80 mb-2">
              <span className="font-mono truncate max-w-[200px]">Sesión: {sessionId}</span>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-red-400 text-[10px]"
              >
                <Trash2 className="w-3 h-3" /> Limpiar
              </button>
            </div>

            {events.length === 0 ? (
              <p className="py-4 text-center text-zinc-500 text-xs">
                Interactúa con el flujo para registrar eventos en tiempo real...
              </p>
            ) : (
              <div className="space-y-1.5 font-mono text-[11px]">
                {events.map((ev, idx) => (
                  <div
                    key={`${ev.eventType}_${idx}_${ev.createdAt}`}
                    className="p-1.5 rounded bg-zinc-800/70 border border-zinc-700/50 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400 uppercase text-[10px]">
                          {ev.eventType}
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          {ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      {ev.details && Object.keys(ev.details).length > 0 && (
                        <div className="text-[10px] text-zinc-300 mt-0.5 break-all">
                          {JSON.stringify(ev.details)}
                        </div>
                      )}
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Colección &quot;events&quot; en Firestore</span>
              </span>
              <span>Rate limit: 60 req/min</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
