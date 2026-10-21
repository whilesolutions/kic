/**
 * Security guard for redirects and input sanitization.
 * Enforces strict whitelist rules:
 * 1. Shopify: Only https://kicksvenezuela.com/products/{handle}?...
 * 2. WhatsApp: Only https://wa.me/584242523184?text=...
 */

export const ALLOWED_SHOPIFY_DOMAIN = 'kicksvenezuela.com';
export const ALLOWED_WHATSAPP_NUMBER = '584242523184';

/**
 * Sanitizes campaign ID parameter (?c=)
 */
export function sanitizeCampaignParam(input: string | null | undefined): string {
  if (!input) return 'default';
  const cleaned = input.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  return cleaned || 'default';
}

/**
 * Sanitizes zone parameter (?z=)
 */
export function sanitizeZoneParam(input: string | null | undefined): 'ccs' | 'int' {
  if (!input) return 'ccs';
  const normalized = input.toLowerCase().trim();
  if (normalized === 'int' || normalized === 'interior') return 'int';
  return 'ccs';
}

/**
 * Validates and builds an approved Shopify product URL.
 * Throws an error or returns null if any attempt is made to bypass kicksvenezuela.com
 */
export function buildSafeShopifyProductUrl(options: {
  productHandle: string;
  variantId?: string;
  campaign: string;
  zone: string;
}): string {
  // Validate handle format (only lowercase alphanumeric and hyphens)
  const cleanHandle = options.productHandle.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80);
  if (!cleanHandle) {
    throw new Error('Invalid product handle');
  }

  const cleanCampaign = sanitizeCampaignParam(options.campaign);
  const cleanZone = sanitizeZoneParam(options.zone);

  const url = new URL(`https://${ALLOWED_SHOPIFY_DOMAIN}/products/${cleanHandle}`);
  
  if (options.variantId) {
    // Shopify variant IDs can be numeric or gid://shopify/ProductVariant/12345
    const cleanVariant = options.variantId.replace(/[^0-9]/g, '');
    if (cleanVariant) {
      url.searchParams.set('variant', cleanVariant);
    }
  }

  url.searchParams.set('utm_source', 'ig_dm');
  url.searchParams.set('utm_campaign', cleanCampaign);
  url.searchParams.set('utm_content', cleanZone);

  // Strict domain verification
  if (url.hostname !== ALLOWED_SHOPIFY_DOMAIN) {
    throw new Error('Unauthorized destination domain');
  }

  return url.toString();
}

/**
 * Generates a short reference code for WhatsApp orders (e.g., "Ref: K7F3")
 */
export function generateReferenceCode(productHandle: string, size: string): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let hash = 0;
  const str = `${productHandle}_${size}_${Date.now() % 100000}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const part1 = chars[Math.abs(hash) % chars.length];
  const part2 = chars[Math.abs(hash >> 5) % chars.length];
  const part3 = chars[Math.abs(hash >> 10) % chars.length];
  const part4 = chars[Math.abs(hash >> 15) % chars.length];
  return `Ref: K${part1}${part2}${part4}`;
}

/**
 * Validates and builds an approved WhatsApp order URL.
 * Only targets wa.me/584242523184.
 */
export function buildSafeWhatsAppUrl(options: {
  productTitle: string;
  size: string;
  price: number;
  refCode: string;
  zone: 'ccs' | 'int';
}): string {
  const zoneLabel = options.zone === 'ccs' ? 'Caracas' : 'Interior del país';
  const text = `¡Hola Kicks Online! Vengo de Instagram y quiero pedir:\n\n👟 Modelo: ${options.productTitle}\n📏 Talla: ${options.size}\n💵 Precio: $${options.price}\n📍 Envío: ${zoneLabel}\n🔖 ${options.refCode}\n\n¿Tienen disponibilidad para procesar mi orden?`;

  const safeUrl = `https://wa.me/${ALLOWED_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  // Double check security
  if (!safeUrl.startsWith(`https://wa.me/${ALLOWED_WHATSAPP_NUMBER}`)) {
    throw new Error('Unauthorized WhatsApp destination');
  }

  return safeUrl;
}
