import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Sparkles, Moon, Sun } from 'lucide-react';
import { Campaign, Zone } from '../types';

interface HeaderProps {
  step: number; // 1, 2, 3 or 4 (final screen)
  campaign: Campaign;
  zone: Zone;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  step,
  campaign,
  zone,
  darkMode,
  onToggleDarkMode,
}) => {
  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string } | null>(null);

  useEffect(() => {
    if (!campaign.fecha_cierre) return;

    const updateCountdown = () => {
      const target = new Date(campaign.fecha_cierre!).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: totalHours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [campaign.fecha_cierre]);

  const displayStep = Math.min(step, 3);
  const progressPercent = (displayStep / 3) * 100;
  const accentColor = campaign.tema?.accentColor || '#EAB308';

  return (
    <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Top Bar with Brand & Zone Indicator */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-950 font-black text-sm shadow-xs"
            style={{ backgroundColor: accentColor }}
          >
            K
          </div>
          <span className="font-extrabold tracking-tight text-zinc-900 dark:text-white text-base">
            KICKS<span style={{ color: accentColor }}>ONLINE</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            VZLA
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <MapPin className="w-3 h-3 text-amber-500" />
            <span>{zone === 'ccs' ? 'Caracas Express' : 'Envíos Interior'}</span>
          </div>

          <button
            onClick={onToggleDarkMode}
            aria-label="Alternar modo oscuro"
            className="p-1.5 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Campaign Hook Banner (Step 0) */}
      <div className="max-w-md mx-auto px-4 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <h1 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1">
                {campaign.titular}
              </h1>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
              {campaign.subtitulo}
            </p>
          </div>

          {/* Hook Price Badge */}
          <div
            className="flex-shrink-0 px-2.5 py-1 rounded-lg text-right shadow-xs"
            style={{
              backgroundColor: campaign.tema?.badgeBg || '#FFF7ED',
              color: campaign.tema?.badgeText || accentColor,
            }}
          >
            <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80 leading-none">
              Precio Promo
            </span>
            <span className="text-xs font-black tracking-tight leading-normal">
              {campaign.etiqueta_precio}
            </span>
          </div>
        </div>

        {/* Live Countdown if fecha_cierre applies */}
        {timeLeft && (
          <div className="mt-2 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/50 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>Cierre de oferta flash:</span>
            </div>
            <div className="font-mono font-bold tracking-wider">
              <span>{timeLeft.hours}</span>:<span>{timeLeft.minutes}</span>:
              <span>{timeLeft.seconds}</span>
            </div>
          </div>
        )}

        {/* Step Progress Bar ("Paso X de 3") */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
            <span>PASO {displayStep} DE 3</span>
            <span>
              {displayStep === 1 && 'Selecciona tu género'}
              {displayStep === 2 && 'Elige tu talla'}
              {displayStep === 3 && 'Selecciona tu modelo'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
