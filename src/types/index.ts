export type Gender = 'caballero' | 'dama';

export type Zone = 'ccs' | 'int';

export type Brand = 'all' | 'Nike' | 'Jordan' | 'New Balance' | 'Adidas' | 'Yeezy';

export interface CampaignTheme {
  accentColor: string; // Hex color code
  accentHover: string;
  badgeBg: string;
  badgeText: string;
}

export interface Campaign {
  id: string;
  titular: string;
  subtitulo: string;
  etiqueta_precio: string;
  handle: string; // Shopify collection handle
  fecha_cierre?: string | null; // ISO string
  mostrar_whatsapp: boolean;
  tema?: Partial<CampaignTheme>;
}

export interface ProductVariant {
  id: string;
  title: string;
  size: string; // e.g. "US 8.5", "US 9" or "41"
  availableForSale: boolean;
  price: number;
  compareAtPrice?: number | null;
  gender: 'caballero' | 'dama' | 'unisex';
}

export interface Product {
  id: string;
  title: string;
  brand: Brand | string;
  handle: string;
  description: string;
  imageUrl: string;
  price: number;
  compareAtPrice?: number | null;
  variants: ProductVariant[];
  availableSizes: string[];
  genders: ('caballero' | 'dama')[];
}

export type EventType =
  | 'page_view'
  | 'step_view'
  | 'brand_selected'
  | 'gender_selected'
  | 'size_selected'
  | 'product_viewed'
  | 'product_click'
  | 'whatsapp_click'
  | 'no_stock_seen'
  | 'scroll_depth'
  | 'rage_click';

export interface TelemetryEvent {
  sessionId: string;
  campaign: string;
  zone: string;
  eventType: EventType;
  device?: {
    type: string;
    screen: string;
    touch: boolean;
  };
  details?: Record<string, string | number | boolean>;
  createdAt?: string;
}
