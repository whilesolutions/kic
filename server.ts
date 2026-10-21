import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase for server-side persistence
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const app = express();
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Security Headers Middleware (Configured to allow AI Studio iframe and Instagram webview)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https: data:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; frame-ancestors *;"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  if (isProd && req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// JSON body parser with strict size limit (max 10kb)
app.use(express.json({ limit: '10kb' }));

// In-Memory Rate Limiter for /api/events (Max 60 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    return;
  }

  clientData.count++;
  next();
}

// In-Memory 5-Minute Cache for Shopify Collections & Products
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cacheStore = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cacheStore.set(key, { data, timestamp: Date.now() });
}

// Curated Genuine Kicks Online Catalog (Shopify handles on kicksvenezuela.com)
// Used directly or as ultra-fast fallback when Storefront token is not yet configured
const MOCK_KICKS_PRODUCTS = [
  {
    id: 'prod_dunk_panda',
    title: 'Nike Dunk Low Retro "Black White" (Panda)',
    handle: 'nike-dunk-low-retro-black-white-panda',
    description: 'El clásico indiscutible. Cuero premium bicolor blanco y negro con amortiguación suave.',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80',
    price: 79,
    compareAtPrice: 99,
    genders: ['caballero', 'dama'],
    availableSizes: ['US 6', 'US 7', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'],
    variants: [
      { id: '4481023901', title: 'US 6 / EU 38.5', size: 'US 6', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'dama' },
      { id: '4481023902', title: 'US 7 / EU 40', size: 'US 7', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'dama' },
      { id: '4481023903', title: 'US 8 / EU 41', size: 'US 8', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'caballero' },
      { id: '4481023904', title: 'US 8.5 / EU 42', size: 'US 8.5', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'caballero' },
      { id: '4481023905', title: 'US 9 / EU 42.5', size: 'US 9', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'caballero' },
      { id: '4481023906', title: 'US 9.5 / EU 43', size: 'US 9.5', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'caballero' },
      { id: '4481023907', title: 'US 10 / EU 44', size: 'US 10', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'caballero' },
      { id: '4481023908', title: 'US 11 / EU 45', size: 'US 11', availableForSale: true, price: 79, compareAtPrice: 99, gender: 'caballero' },
    ],
  },
  {
    id: 'prod_jordan_1_chicago',
    title: 'Air Jordan 1 Retro High OG "Chicago"',
    handle: 'air-jordan-1-retro-high-og-chicago',
    description: 'La silueta más icónica del básquetbol y streetwear mundial en sus colores legendarios.',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
    price: 89,
    compareAtPrice: 110,
    genders: ['caballero', 'dama'],
    availableSizes: ['US 6.5', 'US 7', 'US 8', 'US 8.5', 'US 9', 'US 10'],
    variants: [
      { id: '4481024001', title: 'US 6.5 / EU 39', size: 'US 6.5', availableForSale: true, price: 89, compareAtPrice: 110, gender: 'dama' },
      { id: '4481024002', title: 'US 7 / EU 40', size: 'US 7', availableForSale: true, price: 89, compareAtPrice: 110, gender: 'dama' },
      { id: '4481024003', title: 'US 8 / EU 41', size: 'US 8', availableForSale: true, price: 89, compareAtPrice: 110, gender: 'caballero' },
      { id: '4481024004', title: 'US 8.5 / EU 42', size: 'US 8.5', availableForSale: true, price: 89, compareAtPrice: 110, gender: 'caballero' },
      { id: '4481024005', title: 'US 9 / EU 42.5', size: 'US 9', availableForSale: true, price: 89, compareAtPrice: 110, gender: 'caballero' },
      { id: '4481024006', title: 'US 10 / EU 44', size: 'US 10', availableForSale: true, price: 89, compareAtPrice: 110, gender: 'caballero' },
    ],
  },
  {
    id: 'prod_nb_550',
    title: 'New Balance 550 "White Green"',
    handle: 'new-balance-550-white-green',
    description: 'Estética retro vintage noventera en cuero microperforado de alta resistencia.',
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80',
    price: 75,
    compareAtPrice: 95,
    genders: ['caballero', 'dama'],
    availableSizes: ['US 5.5', 'US 6.5', 'US 7.5', 'US 8.5', 'US 9.5', 'US 10.5'],
    variants: [
      { id: '4481025001', title: 'US 5.5 / EU 38', size: 'US 5.5', availableForSale: true, price: 75, compareAtPrice: 95, gender: 'dama' },
      { id: '4481025002', title: 'US 6.5 / EU 39', size: 'US 6.5', availableForSale: true, price: 75, compareAtPrice: 95, gender: 'dama' },
      { id: '4481025003', title: 'US 7.5 / EU 40.5', size: 'US 7.5', availableForSale: true, price: 75, compareAtPrice: 95, gender: 'dama' },
      { id: '4481025004', title: 'US 8.5 / EU 42', size: 'US 8.5', availableForSale: true, price: 75, compareAtPrice: 95, gender: 'caballero' },
      { id: '4481025005', title: 'US 9.5 / EU 43', size: 'US 9.5', availableForSale: true, price: 75, compareAtPrice: 95, gender: 'caballero' },
      { id: '4481025006', title: 'US 10.5 / EU 44.5', size: 'US 10.5', availableForSale: true, price: 75, compareAtPrice: 95, gender: 'caballero' },
    ],
  },
  {
    id: 'prod_adidas_samba',
    title: 'Adidas Originals Samba OG "Cloud White"',
    handle: 'adidas-originals-samba-og-cloud-white',
    description: 'El par tendencia mundial. Gamuza en puntera T-toe y suela de goma caramelo clásica.',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
    price: 79,
    compareAtPrice: 90,
    genders: ['caballero', 'dama'],
    availableSizes: ['US 6', 'US 7', 'US 8', 'US 8.5', 'US 9', 'US 10'],
    variants: [
      { id: '4481026001', title: 'US 6 / EU 38.5', size: 'US 6', availableForSale: true, price: 79, compareAtPrice: 90, gender: 'dama' },
      { id: '4481026002', title: 'US 7 / EU 40', size: 'US 7', availableForSale: true, price: 79, compareAtPrice: 90, gender: 'dama' },
      { id: '4481026003', title: 'US 8 / EU 41', size: 'US 8', availableForSale: true, price: 79, compareAtPrice: 90, gender: 'caballero' },
      { id: '4481026004', title: 'US 8.5 / EU 42', size: 'US 8.5', availableForSale: true, price: 79, compareAtPrice: 90, gender: 'caballero' },
      { id: '4481026005', title: 'US 9 / EU 42.5', size: 'US 9', availableForSale: true, price: 79, compareAtPrice: 90, gender: 'caballero' },
      { id: '4481026006', title: 'US 10 / EU 44', size: 'US 10', availableForSale: true, price: 79, compareAtPrice: 90, gender: 'caballero' },
    ],
  },
  {
    id: 'prod_jordan_4_military',
    title: 'Air Jordan 4 Retro "Military Black"',
    handle: 'air-jordan-4-retro-military-black',
    description: 'Silueta robusta, alas de ajuste características y unidad Air-Sole visible en el talón.',
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=900&q=80',
    price: 99,
    compareAtPrice: 125,
    genders: ['caballero'],
    availableSizes: ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'],
    variants: [
      { id: '4481027001', title: 'US 8 / EU 41', size: 'US 8', availableForSale: true, price: 99, compareAtPrice: 125, gender: 'caballero' },
      { id: '4481027002', title: 'US 8.5 / EU 42', size: 'US 8.5', availableForSale: true, price: 99, compareAtPrice: 125, gender: 'caballero' },
      { id: '4481027003', title: 'US 9 / EU 42.5', size: 'US 9', availableForSale: true, price: 99, compareAtPrice: 125, gender: 'caballero' },
      { id: '4481027004', title: 'US 9.5 / EU 43', size: 'US 9.5', availableForSale: true, price: 99, compareAtPrice: 125, gender: 'caballero' },
      { id: '4481027005', title: 'US 10 / EU 44', size: 'US 10', availableForSale: true, price: 99, compareAtPrice: 125, gender: 'caballero' },
      { id: '4481027006', title: 'US 11 / EU 45', size: 'US 11', availableForSale: true, price: 99, compareAtPrice: 125, gender: 'caballero' },
    ],
  },
  {
    id: 'prod_dunk_rose_whisper',
    title: 'Nike Dunk Low "Rose Whisper" (W)',
    handle: 'nike-dunk-low-rose-whisper-w',
    description: 'Tonalidad rosa pastel suave combinada con blanco tiza. Espectacular para cualquier outfit.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    price: 79,
    compareAtPrice: 95,
    genders: ['dama'],
    availableSizes: ['US 5.5', 'US 6', 'US 6.5', 'US 7', 'US 7.5', 'US 8'],
    variants: [
      { id: '4481028001', title: 'US 5.5 / EU 36', size: 'US 5.5', availableForSale: true, price: 79, compareAtPrice: 95, gender: 'dama' },
      { id: '4481028002', title: 'US 6 / EU 36.5', size: 'US 6', availableForSale: true, price: 79, compareAtPrice: 95, gender: 'dama' },
      { id: '4481028003', title: 'US 6.5 / EU 37.5', size: 'US 6.5', availableForSale: true, price: 79, compareAtPrice: 95, gender: 'dama' },
      { id: '4481028004', title: 'US 7 / EU 38', size: 'US 7', availableForSale: true, price: 79, compareAtPrice: 95, gender: 'dama' },
      { id: '4481028005', title: 'US 7.5 / EU 38.5', size: 'US 7.5', availableForSale: true, price: 79, compareAtPrice: 95, gender: 'dama' },
      { id: '4481028006', title: 'US 8 / EU 39', size: 'US 8', availableForSale: true, price: 79, compareAtPrice: 95, gender: 'dama' },
    ],
  },
];

// Default Campaigns configuration with Streetwear Yellow accent
const DEFAULT_CAMPAIGNS: Record<string, {
  titular: string;
  subtitulo: string;
  etiqueta_precio: string;
  handle: string;
  fecha_cierre: string | null;
  mostrar_whatsapp: boolean;
  tema: {
    accentColor: string;
    accentHover: string;
    badgeBg: string;
    badgeText: string;
  };
}> = {
  default: {
    titular: 'LLEGARON LOS RETRO DROPS 🔥',
    subtitulo: 'Edición limitada para Caracas e Interior. Selecciona tu talla y asegura tu par en 3 pasos.',
    etiqueta_precio: '$79 (antes $99)',
    handle: 'retro-drops',
    fecha_cierre: new Date(Date.now() + 36 * 3600 * 1000).toISOString(), // 36 hours countdown
    mostrar_whatsapp: true,
    tema: {
      accentColor: '#EAB308', // Vibrant Streetwear Yellow
      accentHover: '#CA8A04',
      badgeBg: '#FEFCE8',
      badgeText: '#854D0E',
    },
  },
  'retro-drops': {
    titular: 'LLEGARON LOS RETRO DROPS 🔥',
    subtitulo: 'Edición limitada para Caracas e Interior. Selecciona tu talla y asegura tu par en 3 pasos.',
    etiqueta_precio: '$79 (antes $99)',
    handle: 'retro-drops',
    fecha_cierre: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    mostrar_whatsapp: true,
    tema: {
      accentColor: '#EAB308', // Vibrant Yellow
      accentHover: '#CA8A04',
      badgeBg: '#FEFCE8',
      badgeText: '#854D0E',
    },
  },
  'dunk-fever': {
    titular: 'DUNK FEVER: COLECCIÓN EXCLUSIVA ⚡',
    subtitulo: 'Los modelos más buscados en Venezuela con entrega inmediata en Caracas y envíos nacionales.',
    etiqueta_precio: '$85 (antes $110)',
    handle: 'dunk-fever',
    fecha_cierre: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    mostrar_whatsapp: true,
    tema: {
      accentColor: '#F59E0B', // Amber Gold
      accentHover: '#D97706',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
    },
  },
  'oferta-flash': {
    titular: 'FLASH SALE 24 HORAS ⏱️',
    subtitulo: 'Pares seleccionados a precio irrepetible. Pocas unidades por talla.',
    etiqueta_precio: '$69 (antes $89)',
    handle: 'oferta-flash',
    fecha_cierre: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    mostrar_whatsapp: true,
    tema: {
      accentColor: '#EAB308', // Yellow
      accentHover: '#CA8A04',
      badgeBg: '#FEFCE8',
      badgeText: '#854D0E',
    },
  },
};

// Seed default campaigns in Firestore if not already present
async function seedCampaignsIfMissing() {
  try {
    for (const [id, campaignData] of Object.entries(DEFAULT_CAMPAIGNS)) {
      const docRef = doc(firestoreDb, 'campaigns', id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        await setDoc(docRef, {
          ...campaignData,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    // Non-blocking in case of offline/transient state
    console.warn('Note: Firestore initial campaign seed handled gracefully', err);
  }
}

// Ensure seeding is triggered in background
seedCampaignsIfMissing();

// Endpoint 1: GET /api/campaigns/:id
app.get('/api/campaigns/:id', async (req: Request, res: Response) => {
  const rawId = req.params.id || 'default';
  const cleanId = rawId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '').slice(0, 40) || 'default';

  // Check cache first
  const cacheKey = `campaign_${cleanId}`;
  const cached = getCached<unknown>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const docRef = doc(firestoreDb, 'campaigns', cleanId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = { id: cleanId, ...snapshot.data() };
      setCache(cacheKey, data);
      res.json(data);
      return;
    }
  } catch (err) {
    console.warn('Firestore campaign read fallback:', err);
  }

  // Fallback to configured campaign or default
  const fallback = DEFAULT_CAMPAIGNS[cleanId] || DEFAULT_CAMPAIGNS['default'];
  const responseData = { id: cleanId, ...fallback };
  setCache(cacheKey, responseData);
  res.json(responseData);
});

// Endpoint 2: GET /api/products
// Fetch from Shopify Storefront API GraphQL with 5-minute cache
app.get('/api/products', async (req: Request, res: Response) => {
  const collectionHandle = (req.query.collection as string)?.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'retro-drops';
  const cacheKey = `products_${collectionHandle}`;
  const cached = getCached<unknown>(cacheKey);

  if (cached) {
    res.json(cached);
    return;
  }

  const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || 'kicksvenezuela.myshopify.com';

  if (storefrontToken && storefrontToken.trim() !== '') {
    try {
      const graphqlQuery = {
        query: `
          query getCollectionProducts($handle: String!) {
            collection(handle: $handle) {
              title
              products(first: 20) {
                edges {
                  node {
                    id
                    title
                    handle
                    description
                    tags
                    featuredImage {
                      url
                    }
                    priceRange {
                      minVariantPrice {
                        amount
                      }
                    }
                    compareAtPriceRange {
                      minVariantPrice {
                        amount
                      }
                    }
                    variants(first: 30) {
                      edges {
                        node {
                          id
                          title
                          availableForSale
                          price {
                            amount
                          }
                          compareAtPrice {
                            amount
                          }
                          selectedOptions {
                            name
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { handle: collectionHandle },
      };

      const response = await fetch(`https://${storeDomain}/api/2024-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify(graphqlQuery),
      });

      if (response.ok) {
        const json = await response.json();
        const rawProducts = json.data?.collection?.products?.edges || [];

        if (rawProducts.length > 0) {
          const transformed = rawProducts.map((edge: any) => {
            const p = edge.node;
            const variants = p.variants.edges.map((v: any) => {
              const node = v.node;
              const sizeOption = node.selectedOptions.find((o: any) =>
                /size|talla|us|eu/i.test(o.name)
              );
              return {
                id: node.id,
                title: node.title,
                size: sizeOption ? sizeOption.value : node.title,
                availableForSale: node.availableForSale,
                price: parseFloat(node.price.amount),
                compareAtPrice: node.compareAtPrice ? parseFloat(node.compareAtPrice.amount) : null,
                gender: /dama|women|mujer/i.test(p.title + ' ' + (p.tags || []).join(' ')) ? 'dama' : 'caballero',
              };
            });

            const availableSizes = Array.from(
              new Set(
                variants
                  .filter((v: any) => v.availableForSale)
                  .map((v: any) => v.size)
              )
            );

            return {
              id: p.id,
              title: p.title,
              handle: p.handle,
              description: p.description || '',
              imageUrl: p.featuredImage?.url || MOCK_KICKS_PRODUCTS[0].imageUrl,
              price: parseFloat(p.priceRange.minVariantPrice.amount),
              compareAtPrice: p.compareAtPriceRange?.minVariantPrice ? parseFloat(p.compareAtPriceRange.minVariantPrice.amount) : null,
              variants,
              availableSizes,
              genders: /dama|women|mujer/i.test(p.title) ? ['dama'] : ['caballero', 'dama'],
            };
          });

          setCache(cacheKey, transformed);
          res.json(transformed);
          return;
        }
      }
    } catch (shopifyError) {
      console.warn('Shopify Storefront API error, falling back to curated inventory:', shopifyError);
    }
  }

  // Fallback to ultra-fast genuine catalog
  setCache(cacheKey, MOCK_KICKS_PRODUCTS);
  res.json(MOCK_KICKS_PRODUCTS);
});

// Endpoint 3: POST /api/events
// Telemetry ingest with strict schema, rate limiting, and zero PII
app.post('/api/events', rateLimiter, async (req: Request, res: Response): Promise<void> => {
  const payload = req.body;

  if (!payload || typeof payload !== 'object') {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const allowedEventTypes = [
    'page_view',
    'step_view',
    'brand_selected',
    'gender_selected',
    'size_selected',
    'product_viewed',
    'product_click',
    'whatsapp_click',
    'no_stock_seen',
    'scroll_depth',
    'rage_click',
  ];

  const { sessionId, campaign, zone, eventType, device, details } = payload;

  if (
    typeof sessionId !== 'string' ||
    sessionId.length < 4 ||
    sessionId.length > 64 ||
    !/^[a-zA-Z0-9_-]+$/.test(sessionId)
  ) {
    res.status(400).json({ error: 'Invalid sessionId' });
    return;
  }

  if (typeof campaign !== 'string' || campaign.length > 64) {
    res.status(400).json({ error: 'Invalid campaign' });
    return;
  }

  if (typeof zone !== 'string' || (zone !== 'ccs' && zone !== 'int' && zone !== 'unknown')) {
    res.status(400).json({ error: 'Invalid zone' });
    return;
  }

  if (typeof eventType !== 'string' || !allowedEventTypes.includes(eventType)) {
    res.status(400).json({ error: 'Invalid eventType' });
    return;
  }

  // Strict PII Check: block any field or detail containing email or phone signatures
  const serialized = JSON.stringify(payload);
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /\+?58\s?4[0-9]{2}[0-9]{7}/;
  if (emailRegex.test(serialized) || phoneRegex.test(serialized)) {
    res.status(400).json({ error: 'PII not allowed in telemetry' });
    return;
  }

  const cleanEvent = {
    sessionId,
    campaign: campaign.slice(0, 64),
    zone,
    eventType,
    device: typeof device === 'object' && device !== null ? device : {},
    details: typeof details === 'object' && details !== null ? details : {},
    createdAt: new Date().toISOString(),
  };

  try {
    const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const eventRef = doc(firestoreDb, 'events', eventId);
    await setDoc(eventRef, cleanEvent);
  } catch (err) {
    // Non-blocking for client speed
    console.warn('Firestore event write handled gracefully', err);
  }

  res.json({ ok: true });
});

// Endpoint 4: GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', store: 'Kicks Online Venezuela' });
});

// Mount Vite or serve static assets
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kicks Online Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
