import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Gender } from '../types';

interface Step2SizeProps {
  gender: Gender;
  availableSizes: string[];
  selectedSize: string | null;
  lastRememberedSize: string | null;
  onSelectSize: (size: string) => void;
  onBack: () => void;
  accentColor: string;
}

export const Step2Size: React.FC<Step2SizeProps> = ({
  gender,
  availableSizes,
  selectedSize,
  lastRememberedSize,
  onSelectSize,
  onBack,
  accentColor,
}) => {
  const [sizeFormat, setSizeFormat] = useState<'US' | 'EU'>('US');

  // Helper map from US to EU approximation for Venezuelan sneakerheads
  const usToEuMap: Record<string, string> = {
    'US 5': 'EU 35.5',
    'US 5.5': 'EU 36',
    'US 6': 'EU 36.5',
    'US 6.5': 'EU 37.5',
    'US 7': 'EU 38',
    'US 7.5': 'EU 38.5',
    'US 8': 'EU 39',
    'US 8.5': 'EU 40',
    'US 9': 'EU 41',
    'US 9.5': 'EU 42',
    'US 10': 'EU 42.5',
    'US 10.5': 'EU 43',
    'US 11': 'EU 44',
    'US 11.5': 'EU 44.5',
    'US 12': 'EU 45',
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-center animate-fade-in">
      {/* Back button */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cambiar a {gender === 'caballero' ? 'Dama' : 'Caballero'}</span>
        </button>

        {/* Format toggle: US / EU */}
        <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setSizeFormat('US')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              sizeFormat === 'US'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            US
          </button>
          <button
            type="button"
            onClick={() => setSizeFormat('EU')}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              sizeFormat === 'EU'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            EU
          </button>
        </div>
      </div>

      <div className="text-center mb-5">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          ¿Cuál es tu talla?
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Solo mostramos tallas con stock real inmediato en inventario
        </p>
      </div>

      {/* Size Grid (Large tactile buttons, min 48px height) */}
      {availableSizes.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {availableSizes.map((size) => {
            const isSelected = selectedSize === size;
            const isLastRemembered = lastRememberedSize === size;
            const euEquivalent = usToEuMap[size] || '';

            return (
              <button
                key={size}
                type="button"
                onClick={() => onSelectSize(size)}
                className={`relative min-h-[58px] p-2.5 rounded-xl border-2 transition-all duration-150 flex flex-col items-center justify-center active:scale-[0.96] ${
                  isSelected
                    ? 'border-transparent text-zinc-950 shadow-sm font-black'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
                style={{
                  backgroundColor: isSelected ? accentColor : undefined,
                }}
              >
                {/* Last used badge */}
                {isLastRemembered && !isSelected && (
                  <span className="absolute -top-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Tu talla
                  </span>
                )}

                <span className="text-base font-black tracking-tight leading-none">
                  {sizeFormat === 'US' ? size : euEquivalent || size}
                </span>

                <span
                  className={`text-[10px] font-semibold mt-1 leading-none ${
                    isSelected ? 'text-zinc-950/80 font-bold' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {sizeFormat === 'US' ? euEquivalent : size}
                </span>

                {isSelected && (
                  <span className="absolute right-1.5 top-1.5 text-zinc-950">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No encontramos tallas registradas en este momento
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 text-xs font-bold underline text-amber-600 dark:text-amber-400"
          >
            Volver al paso anterior
          </button>
        </div>
      )}

      {lastRememberedSize && availableSizes.includes(lastRememberedSize) && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => onSelectSize(lastRememberedSize)}
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:underline"
          >
            Continuar rápido con tu talla guardada ({lastRememberedSize})
          </button>
        </div>
      )}
    </div>
  );
};
