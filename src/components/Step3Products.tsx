import React from 'react';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { Product, Gender } from '../types';

interface Step3ProductsProps {
  products: Product[];
  gender: Gender;
  size: string;
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
  accentColor: string;
}

export const Step3Products: React.FC<Step3ProductsProps> = ({
  products,
  gender,
  size,
  onSelectProduct,
  onBack,
  accentColor,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 animate-fade-in pb-12">
      {/* Back button & Current filter chip */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cambiar talla ({size})</span>
        </button>

        <span className="text-[11px] font-bold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 capitalize">
          {gender} • {size}
        </span>
      </div>

      <div className="text-center mb-5">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
          Elige tu par favorito
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {products.length} modelos disponibles en talla {size}
        </p>
      </div>

      {/* Product List: 4 to 6 items */}
      <div className="space-y-3.5">
        {products.map((product) => {
          return (
            <div
              key={product.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col"
            >
              <div className="relative w-full h-44 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                  <span>En stock talla {size}</span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug">
                    {product.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                    {product.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-zinc-900 dark:text-white">
                      ${product.price}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xs font-semibold text-zinc-400 line-through">
                        ${product.compareAtPrice}
                      </span>
                    )}
                  </div>

                  {/* Single button per card (min 48px height, high-tactile touch target) */}
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="min-h-[48px] px-5 rounded-xl font-black text-sm text-zinc-950 shadow-xs active:scale-[0.97] transition-all flex items-center gap-2"
                    style={{ backgroundColor: accentColor }}
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>Elegir este</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
