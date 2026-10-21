import React, { useEffect } from 'react';
import { ArrowLeft, MessageCircle, AlertCircle } from 'lucide-react';
import { Gender, Zone } from '../types';
import { buildSafeWhatsAppUrl, generateReferenceCode } from '../lib/security';
import { telemetry } from '../lib/analytics';

interface NoStockFallbackProps {
  gender: Gender;
  size: string;
  zone: Zone;
  campaignId: string;
  onBack: () => void;
  accentColor: string;
}

export const NoStockFallback: React.FC<NoStockFallbackProps> = ({
  gender,
  size,
  zone,
  campaignId,
  onBack,
  accentColor,
}) => {
  const refCode = generateReferenceCode('custom-request', size);

  useEffect(() => {
    // Record no_stock_seen telemetry event
    telemetry.track('no_stock_seen', {
      gender,
      requestedSize: size,
      campaign: campaignId,
    });
  }, [gender, size, campaignId]);

  const handleWhatsAppConsult = () => {
    try {
      telemetry.track('whatsapp_click', {
        type: 'no_stock_inquiry',
        gender,
        size,
        refCode,
      });

      const safeUrl = buildSafeWhatsAppUrl({
        productTitle: `Consulta de stock para ${gender === 'caballero' ? 'Caballero' : 'Dama'}`,
        size,
        price: 0,
        refCode,
        zone,
      });

      window.location.href = safeUrl;
    } catch (err) {
      console.error('WhatsApp redirect check failed', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 animate-fade-in text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
        ¡Agotado temporalmente en talla {size}!
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
        Los modelos en talla {size} para {gender} volaron rápido. ¡Pero podemos conseguírtelo o avisarte del reingreso directo por WhatsApp!
      </p>

      <div className="mt-6 space-y-3">
        {/* Primary Action: Consult WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsAppConsult}
          className="w-full min-h-[50px] rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-md transition-all flex items-center justify-center gap-2 border border-emerald-500"
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
          <span>Consultar por WhatsApp ({refCode})</span>
        </button>

        {/* Back button to try another size */}
        <button
          type="button"
          onClick={onBack}
          className="w-full min-h-[48px] rounded-xl font-semibold text-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ver otras tallas disponibles</span>
        </button>
      </div>

      <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
        📍 Nuestro equipo en Caracas te responderá en minutos
      </div>
    </div>
  );
};
