import React from 'react';
import { Tag, Sparkles, Flame, Check } from 'lucide-react';
import { Campaign, Brand } from '../types';

interface Step0BrandPromoProps {
  campaign: Campaign;
  selectedBrand: Brand;
  onSelectBrandOrPromo: (brand: Brand, promoTitle?: string) => void;
  accentColor: string;
}

export const Step0BrandPromo: React.FC<Step0BrandPromoProps> = ({
  campaign,
  selectedBrand,
  onSelectBrandOrPromo,
  accentColor,
}) => {
  const brandList: { id: Brand; name: string; subtitle: string; tag: string }[] = [
    { id: 'Nike', name: 'Nike', subtitle: 'Dunk Low, Air Force, Running', tag: 'Top Ventas' },
    { id: 'Jordan', name: 'Air Jordan', subtitle: 'Retro 1, 4s & Ediciones Especiales', tag: 'Hype' },
    { id: 'New Balance', name: 'New Balance', subtitle: '550, 9060 & Retro Vintage', tag: 'Tendencia' },
    { id: 'Adidas', name: 'Adidas Originals', subtitle: 'Samba OG, Gazelle & Campus', tag: 'Clásico' },
    { id: 'Yeezy', name: 'Yeezy', subtitle: 'Slides Onyx & Foam', tag: 'Confort' },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5 animate-fade-in">
      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-900 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-300/60 mb-2">
          <Sparkles className="w-3 h-3 text-yellow-600" />
          Kicks Online Venezuela
        </span>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          ¿Qué promo o marca buscas?
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          Elige la oferta activa o filtra directo por tu silueta favorita
        </p>
      </div>

      {/* Hero Promo Card */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onSelectBrandOrPromo('all', campaign.titular)}
          className="w-full p-4 rounded-2xl border-2 border-yellow-400 dark:border-yellow-500/80 bg-gradient-to-br from-yellow-50 to-amber-100/70 dark:from-yellow-950/30 dark:to-zinc-900 text-left transition-all duration-200 active:scale-[0.98] shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-400 text-zinc-950">
                  <Flame className="w-3 h-3 fill-zinc-950" />
                  PROMO ACTIVA
                </span>
                <span className="text-xs font-black text-yellow-800 dark:text-yellow-300">
                  {campaign.etiqueta_precio}
                </span>
              </div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white leading-tight">
                {campaign.titular}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 line-clamp-1">
                {campaign.subtitulo}
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-zinc-950 font-black flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              →
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-yellow-200/80 dark:border-yellow-900/40 flex items-center justify-between text-[11px] font-bold text-yellow-900 dark:text-yellow-200">
            <span>Ver toda la colección de la campaña</span>
            <span className="underline">Aprovechar oferta</span>
          </div>
        </button>
      </div>

      {/* Brands Selection Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
            O selecciona por marca:
          </span>
          <button
            type="button"
            onClick={() => onSelectBrandOrPromo('all')}
            className="text-[11px] font-bold text-yellow-600 dark:text-yellow-400 hover:underline"
          >
            Ver todas las marcas
          </button>
        </div>

        {brandList.map((brand) => {
          const isSelected = selectedBrand === brand.id;

          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => onSelectBrandOrPromo(brand.id)}
              className={`w-full min-h-[56px] px-4 py-3 rounded-xl border-2 transition-all duration-150 flex items-center justify-between text-left active:scale-[0.98] ${
                isSelected
                  ? 'border-yellow-400 bg-yellow-400/10 dark:bg-yellow-400/15'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center font-black text-sm text-zinc-800 dark:text-zinc-200">
                  {brand.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {brand.name}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {brand.tag}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                    {brand.subtitle}
                  </span>
                </div>
              </div>

              <div className="text-zinc-400 font-bold text-sm">
                {isSelected ? (
                  <span className="w-6 h-6 rounded-full bg-yellow-400 text-zinc-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                ) : (
                  '→'
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
