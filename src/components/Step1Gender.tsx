import React from 'react';
import { User, Sparkles, ArrowLeft } from 'lucide-react';
import { Gender } from '../types';

interface Step1GenderProps {
  selectedGender: Gender | null;
  onSelectGender: (gender: Gender) => void;
  onBack: () => void;
  selectedBrand: string;
  accentColor: string;
}

export const Step1Gender: React.FC<Step1GenderProps> = ({
  selectedGender,
  onSelectGender,
  onBack,
  selectedBrand,
  accentColor,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-center animate-fade-in">
      {/* Back button & Brand badge */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cambiar marca / promo</span>
        </button>

        <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-300/60">
          {selectedBrand === 'all' ? 'Todas las marcas' : selectedBrand}
        </span>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          ¿Para quién buscas calzado?
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Filtramos inmediatamente solo las tallas y modelos disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Button 1: Caballero */}
        <button
          type="button"
          onClick={() => onSelectGender('caballero')}
          className={`group relative w-full min-h-[96px] p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-left active:scale-[0.98] ${
            selectedGender === 'caballero'
              ? 'border-transparent shadow-md'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
          style={{
            backgroundColor: selectedGender === 'caballero' ? accentColor : undefined,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                selectedGender === 'caballero'
                  ? 'bg-zinc-950/15 text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <User className="w-7 h-7" />
            </div>
            <div>
              <span
                className={`text-xl font-black tracking-tight block ${
                  selectedGender === 'caballero'
                    ? 'text-zinc-950'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                Caballero
              </span>
              <span
                className={`text-xs block mt-0.5 ${
                  selectedGender === 'caballero'
                    ? 'text-zinc-950/80 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Tallas US 7 a 12 (EU 40 a 45)
              </span>
            </div>
          </div>

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              selectedGender === 'caballero'
                ? 'bg-zinc-950 text-white'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'
            }`}
          >
            →
          </div>
        </button>

        {/* Button 2: Dama */}
        <button
          type="button"
          onClick={() => onSelectGender('dama')}
          className={`group relative w-full min-h-[96px] p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-left active:scale-[0.98] ${
            selectedGender === 'dama'
              ? 'border-transparent shadow-md'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
          }`}
          style={{
            backgroundColor: selectedGender === 'dama' ? accentColor : undefined,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                selectedGender === 'dama'
                  ? 'bg-zinc-950/15 text-zinc-950'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <span
                className={`text-xl font-black tracking-tight block ${
                  selectedGender === 'dama'
                    ? 'text-zinc-950'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                Dama
              </span>
              <span
                className={`text-xs block mt-0.5 ${
                  selectedGender === 'dama'
                    ? 'text-zinc-950/80 font-medium'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Tallas US 5.5 a 8.5 (EU 36 a 40)
              </span>
            </div>
          </div>

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              selectedGender === 'dama'
                ? 'bg-zinc-950 text-white'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'
            }`}
          >
            →
          </div>
        </button>
      </div>

      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-full">
          ⚡ Experiencia directa sin registros ni pasos innecesarios
        </span>
      </div>
    </div>
  );
};
