import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, Play, RotateCcw } from 'lucide-react';
import { Zone, Gender } from '../types';

interface CampaignBarProps {
  currentCampaignId: string;
  currentZone: Zone;
  onSwitchCampaign: (campaignId: string, zone: Zone) => void;
  onAutoFillFlow: (scenario: 'caballero' | 'dama' | 'no-stock') => void;
  onReset: () => void;
}

export const CampaignBar: React.FC<CampaignBarProps> = ({
  currentCampaignId,
  currentZone,
  onSwitchCampaign,
  onAutoFillFlow,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const presets = [
    { c: 'retro-drops', z: 'ccs', label: 'Retro Drops (Caracas)' },
    { c: 'retro-drops', z: 'int', label: 'Retro Drops (Interior)' },
    { c: 'dunk-fever', z: 'ccs', label: 'Dunk Fever (Caracas)' },
    { c: 'oferta-flash', z: 'ccs', label: 'Oferta Flash 24H (Caracas)' },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-6 mb-16">
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/90 shadow-md p-3 text-xs">
        {/* Toggle header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Panel de Pruebas & Simulación (?c={currentCampaignId}&z={currentZone})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isOpen && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            {/* Quick Demo Walkthrough Buttons */}
            <div>
              <span className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                ⚡ Llenar Flujo con Datos Ficticios (1 clic)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAutoFillFlow('caballero')}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
                >
                  <Play className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>Caballero (US 9)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAutoFillFlow('dama')}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-pink-600 text-white flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
                >
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span>Dama (US 6.5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAutoFillFlow('no-stock')}
                  className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-amber-500 text-white flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
                >
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span>Sin Stock (US 12)</span>
                </button>
              </div>
            </div>

            {/* Campaign Preset Switcher */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  🎯 Parámetros de Campaña en URL
                </span>
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reiniciar flujo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {presets.map((preset) => (
                  <button
                    key={`${preset.c}_${preset.z}`}
                    type="button"
                    onClick={() => onSwitchCampaign(preset.c, preset.z as Zone)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-colors ${
                      currentCampaignId === preset.c && currentZone === preset.z
                        ? 'bg-yellow-400 text-zinc-950 font-black shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight">
              Los cambios de campaña actualizan en tiempo real el titular, la oferta gancho, el contador regresivo de cierre y los colores en Firestore.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
