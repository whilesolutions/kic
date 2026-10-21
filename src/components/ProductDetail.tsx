import React, { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { Product, Zone, Campaign } from '../types';
import {
  buildSafeShopifyProductUrl,
  buildSafeWhatsAppUrl,
  generateReferenceCode,
  ALLOWED_SHOPIFY_DOMAIN,
  ALLOWED_WHATSAPP_NUMBER,
} from '../lib/security';
import { telemetry } from '../lib/analytics';

interface ProductDetailProps {
  product: Product;
  selectedSize: string;
  campaign: Campaign;
  zone: Zone;
  onBack: () => void;
  accentColor: string;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  selectedSize,
  campaign,
  zone,
  onBack,
  accentColor,
}) => {
  const [modalType, setModalType] = useState<'shopify' | 'whatsapp' | null>(null);
  const [copied, setCopied] = useState(false);

  // Find exact matching variant
  const matchedVariant =
    product.variants.find((v) => v.size.toLowerCase() === selectedSize.toLowerCase()) ||
    product.variants[0];

  const variantId = matchedVariant?.id;
  const refCode = generateReferenceCode(product.handle, selectedSize);

  // Generate safe URLs
  const safeShopifyUrl = buildSafeShopifyProductUrl({
    productHandle: product.handle,
    variantId,
    campaign: campaign.id,
    zone,
  });

  const safeWhatsAppUrl = buildSafeWhatsAppUrl({
    productTitle: product.title,
    size: selectedSize,
    price: product.price,
    refCode,
    zone,
  });

  const zoneLabel = zone === 'ccs' ? 'Caracas (Express)' : 'Interior del país (Nacional)';

  const whatsAppMessage = `¡Hola Kicks Online! Vengo de Instagram y quiero pedir:\n\n👟 Modelo: ${product.title}\n📏 Talla: ${selectedSize}\n💵 Precio: $${product.price}\n📍 Envío: ${zoneLabel}\n🔖 ${refCode}\n\n¿Tienen disponibilidad para procesar mi orden?`;

  const handleBuyOnShopify = () => {
    telemetry.track('product_click', {
      productId: product.id,
      handle: product.handle,
      variantId: variantId || '',
      price: product.price,
      size: selectedSize,
    });
    setModalType('shopify');
  };

  const handleOrderByWhatsApp = () => {
    telemetry.track('whatsapp_click', {
      productId: product.id,
      handle: product.handle,
      refCode,
      price: product.price,
      size: selectedSize,
    });
    setModalType('whatsapp');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 animate-fade-in pb-20">
      {/* Back button */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a modelos</span>
        </button>

        <span className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
          {refCode}
        </span>
      </div>

      {/* Product Hero Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm mb-5">
        <div className="relative w-full h-64 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>Talla {selectedSize} Confirmada</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Kicks Online Official
              </span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
                {product.title}
              </h2>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-2xl font-black text-zinc-900 dark:text-white block leading-none">
                ${product.price}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs font-bold text-zinc-400 line-through">
                  ${product.compareAtPrice}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Delivery & Trust highlights */}
          <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span>{zone === 'ccs' ? 'Delivery express Caracas' : 'Envío asegurado nacional'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>Garantía de originalidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Actions: 1 Primary + 1 Secondary (Min 48px height) */}
      <div className="space-y-3">
        {/* Main Primary Button: Comprar en Shopify Store */}
        <button
          type="button"
          onClick={handleBuyOnShopify}
          className="w-full min-h-[54px] rounded-xl font-black text-base text-zinc-950 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          style={{ backgroundColor: accentColor }}
        >
          <span>Comprar en Web ({ALLOWED_SHOPIFY_DOMAIN})</span>
          <ExternalLink className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Secondary Button: Pedir por WhatsApp */}
        {campaign.mostrar_whatsapp && (
          <button
            type="button"
            onClick={handleOrderByWhatsApp}
            className="w-full min-h-[50px] rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-xs transition-all flex items-center justify-center gap-2 border border-emerald-500"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            <span>Pedir por WhatsApp (+{ALLOWED_WHATSAPP_NUMBER})</span>
          </button>
        )}
      </div>

      {/* Trust Micro-copy */}
      <div className="mt-4 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
        🔒 Redirección segura verificada hacia {ALLOWED_SHOPIFY_DOMAIN} y atención oficial
      </div>

      {/* Action / Redirection Simulation Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {modalType === 'shopify' ? 'Destino Shopify Verificado' : 'Mensaje WhatsApp Listo'}
              </span>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {modalType === 'shopify' ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  En producción móvil, esta acción abre la pasarela oficial en Shopify con variante y UTMs precargados:
                </p>
                <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 break-all border border-zinc-200 dark:border-zinc-700">
                  {safeShopifyUrl}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={safeShopifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[48px] rounded-xl font-black text-sm text-zinc-950 flex items-center justify-center gap-2 shadow-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    <span>Abrir en KicksVenezuela.com</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(safeShopifyUrl)}
                    className="w-full min-h-[42px] rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡URL Copiada!' : 'Copiar URL con parámetros'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Mensaje prellenado para el WhatsApp oficial (+58 424 252 3184):
                </p>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs whitespace-pre-line border border-emerald-200 dark:border-emerald-800">
                  {whatsAppMessage}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={safeWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[48px] rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Iniciar Chat de WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(whatsAppMessage)}
                    className="w-full min-h-[42px] rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Texto Copiado!' : 'Copiar mensaje para WhatsApp'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
