import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Step0BrandPromo } from './components/Step0BrandPromo';
import { Step1Gender } from './components/Step1Gender';
import { Step2Size } from './components/Step2Size';
import { Step3Products } from './components/Step3Products';
import { ProductDetail } from './components/ProductDetail';
import { NoStockFallback } from './components/NoStockFallback';
import { CampaignBar } from './components/CampaignBar';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { Campaign, Gender, Product, Zone, Brand, TelemetryEvent } from './types';
import { sanitizeCampaignParam, sanitizeZoneParam } from './lib/security';
import {
  telemetry,
  initInteractionTelemetry,
  saveLastSelectedSize,
  getLastSelectedSize,
  getOrCreateSessionId,
} from './lib/analytics';
import { testConnection } from './lib/firebase';
import { INITIAL_PRODUCTS } from './data/defaultCatalog';

export default function App() {
  // Parse and sanitize URL query params
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));
  const campaignParam = sanitizeCampaignParam(searchParams.get('c'));
  const zoneParam: Zone = sanitizeZoneParam(searchParams.get('z'));

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('ko_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Funnel state: 1: Brand/Promo, 2: Gender, 3: Size, 4: Products, 5: ProductDetail
  const [step, setStep] = useState<number>(1);
  const [selectedBrand, setSelectedBrand] = useState<Brand>('all');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Live Telemetry events log for verification
  const [liveEvents, setLiveEvents] = useState<TelemetryEvent[]>([]);
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  // Data state
  const [campaign, setCampaign] = useState<Campaign>({
    id: campaignParam,
    titular: 'LLEGARON LOS RETRO DROPS 🔥',
    subtitulo: 'Edición limitada para Caracas e Interior. Selecciona tu talla y asegura tu par en 3 pasos.',
    etiqueta_precio: '$79 (antes $99)',
    handle: 'retro-drops',
    fecha_cierre: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    mostrar_whatsapp: true,
    tema: {
      accentColor: '#EAB308',
      accentHover: '#CA8A04',
      badgeBg: '#FEFCE8',
      badgeText: '#854D0E',
    },
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('ko_dark_mode', String(darkMode));
    } catch {
      // Ignore storage errors
    }
  }, [darkMode]);

  // Subscribe to live telemetry events
  useEffect(() => {
    const unsub = telemetry.onEvent((ev) => {
      setLiveEvents((prev) => [ev, ...prev].slice(0, 30));
    });
    return unsub;
  }, []);

  // Test Firebase connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Initialize analytics & telemetry
  useEffect(() => {
    const cleanup = initInteractionTelemetry(campaignParam, zoneParam);
    telemetry.track('page_view', {
      campaign: campaignParam,
      zone: zoneParam,
      referrer: document.referrer || 'instagram_dm',
    });
    return cleanup;
  }, [campaignParam, zoneParam]);

  // Track step views
  useEffect(() => {
    telemetry.track('step_view', {
      step,
      brand: selectedBrand,
      gender: selectedGender || 'none',
      size: selectedSize || 'none',
    });
  }, [step, selectedBrand, selectedGender, selectedSize]);

  // Fetch campaign and products from server cache/Shopify
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // 1. Fetch Campaign
        const campRes = await fetch(`/api/campaigns/${campaignParam}`);
        if (campRes.ok && isMounted) {
          const campData = await campRes.json();
          setCampaign(campData);

          // 2. Fetch Products for campaign handle
          const prodRes = await fetch(`/api/products?collection=${campData.handle || 'retro-drops'}`);
          if (prodRes.ok && isMounted) {
            const prodData = await prodRes.json();
            setProducts(prodData);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch campaign data, keeping defaults:', err);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [campaignParam]);

  // Compute available sizes for the chosen gender and brand
  const availableSizes = useMemo(() => {
    if (!selectedGender || products.length === 0) {
      return ['US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'];
    }

    const sizesSet = new Set<string>();
    const matchingProducts = products.filter((p) => {
      const brandMatch = selectedBrand === 'all' || p.brand === selectedBrand;
      const genderMatch = p.genders.includes(selectedGender);
      return brandMatch && genderMatch;
    });

    const pool = matchingProducts.length > 0 ? matchingProducts : products.filter((p) => p.genders.includes(selectedGender));

    pool.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.availableForSale && (v.gender === selectedGender || v.gender === 'unisex')) {
          sizesSet.add(v.size);
        }
      });
    });

    if (sizesSet.size === 0) {
      pool.forEach((p) => {
        p.availableSizes.forEach((s) => sizesSet.add(s));
      });
    }

    return Array.from(sizesSet).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
      return numA - numB;
    });
  }, [selectedGender, selectedBrand, products]);

  // Filter 4 to 6 products matching brand + gender + selected size with stock
  const filteredProducts = useMemo(() => {
    if (!selectedGender || !selectedSize) return [];

    const matches = products.filter((p) => {
      const brandMatch = selectedBrand === 'all' || p.brand === selectedBrand;
      const genderMatch = p.genders.includes(selectedGender);
      const sizeMatch =
        p.variants.some(
          (v) =>
            v.size.toLowerCase() === selectedSize.toLowerCase() &&
            v.availableForSale &&
            (v.gender === selectedGender || v.gender === 'unisex')
        ) || p.availableSizes.includes(selectedSize);

      return brandMatch && genderMatch && sizeMatch;
    });

    return matches.slice(0, 6);
  }, [products, selectedBrand, selectedGender, selectedSize]);

  // Step Handlers
  const handleSelectBrandOrPromo = (brand: Brand, promoTitle?: string) => {
    setSelectedBrand(brand);
    telemetry.track('brand_selected', {
      brand: brand === 'all' ? 'promo_all' : brand,
      promo: promoTitle || campaign.titular,
    });
    setStep(2); // Go to "¿Para quién?"
  };

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(gender);
    telemetry.track('gender_selected', { gender, brand: selectedBrand });
    setStep(3); // Go to "¿Qué talla?"
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    saveLastSelectedSize(size);
    telemetry.track('size_selected', { size, gender: selectedGender || '', brand: selectedBrand });
    setStep(4); // Go to Product list
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    telemetry.track('product_viewed', {
      productId: product.id,
      title: product.title,
      handle: product.handle,
      price: product.price,
    });
    setStep(5); // Go to ProductDetail
  };

  const handleBackToStep1 = () => {
    setStep(1);
  };

  const handleBackToStep2 = () => {
    setStep(2);
    setSelectedGender(null);
  };

  const handleBackToStep3 = () => {
    setStep(3);
    setSelectedSize(null);
  };

  const handleBackToStep4 = () => {
    setStep(4);
    setSelectedProduct(null);
  };

  const handleSwitchCampaign = useCallback((newCampaign: string, newZone: Zone) => {
    const url = new URL(window.location.href);
    url.searchParams.set('c', newCampaign);
    url.searchParams.set('z', newZone);
    window.history.pushState({}, '', url.toString());
    setSearchParams(new URLSearchParams(url.search));
    setStep(1);
    setSelectedBrand('all');
    setSelectedGender(null);
    setSelectedSize(null);
    setSelectedProduct(null);
  }, []);

  // One-click demo walk-through filler
  const handleAutoFillFlow = (scenario: 'caballero' | 'dama' | 'no-stock') => {
    if (scenario === 'caballero') {
      const brand: Brand = 'Nike';
      const gender: Gender = 'caballero';
      const size = 'US 9';
      setSelectedBrand(brand);
      setSelectedGender(gender);
      setSelectedSize(size);
      saveLastSelectedSize(size);
      telemetry.track('brand_selected', { brand, demo_preset: true });
      telemetry.track('gender_selected', { gender, demo_preset: true });
      telemetry.track('size_selected', { size, gender, demo_preset: true });

      const prod = products.find((p) => p.handle.includes('dunk-low')) || products[0];
      setSelectedProduct(prod);
      telemetry.track('product_viewed', {
        productId: prod.id,
        title: prod.title,
        handle: prod.handle,
        price: prod.price,
      });
      setStep(5); // Go to final screen
    } else if (scenario === 'dama') {
      const brand: Brand = 'Jordan';
      const gender: Gender = 'dama';
      const size = 'US 6.5';
      setSelectedBrand(brand);
      setSelectedGender(gender);
      setSelectedSize(size);
      saveLastSelectedSize(size);
      telemetry.track('brand_selected', { brand, demo_preset: true });
      telemetry.track('gender_selected', { gender, demo_preset: true });
      telemetry.track('size_selected', { size, gender, demo_preset: true });

      const prod = products.find((p) => p.handle.includes('chicago') || p.handle.includes('rose')) || products[1];
      setSelectedProduct(prod);
      telemetry.track('product_viewed', {
        productId: prod.id,
        title: prod.title,
        handle: prod.handle,
        price: prod.price,
      });
      setStep(5);
    } else if (scenario === 'no-stock') {
      const brand: Brand = 'Yeezy';
      const gender: Gender = 'dama';
      const size = 'US 12';
      setSelectedBrand(brand);
      setSelectedGender(gender);
      setSelectedSize(size);
      setSelectedProduct(null);
      setStep(4); // Shows NoStockFallback
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedBrand('all');
    setSelectedGender(null);
    setSelectedSize(null);
    setSelectedProduct(null);
  };

  const accentColor = campaign.tema?.accentColor || '#EAB308';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Step 0: Header with Campaign Hook, Price Tag, Countdown & Progress Bar */}
      <Header
        step={step}
        campaign={campaign}
        zone={zoneParam}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Main Funnel Body */}
      <main className="flex-1 flex flex-col justify-start">
        {loading ? (
          <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4">
            <div
              className="w-10 h-10 border-4 border-zinc-200 border-t-current rounded-full animate-spin"
              style={{ color: accentColor }}
            />
            <p className="text-xs font-semibold text-zinc-500">Cargando inventario oficial...</p>
          </div>
        ) : (
          <>
            {/* Step 1: "¿Qué promo o marca buscas?" */}
            {step === 1 && (
              <Step0BrandPromo
                campaign={campaign}
                selectedBrand={selectedBrand}
                onSelectBrandOrPromo={handleSelectBrandOrPromo}
                accentColor={accentColor}
              />
            )}

            {/* Step 2: "¿Para quién?" */}
            {step === 2 && (
              <Step1Gender
                selectedGender={selectedGender}
                onSelectGender={handleSelectGender}
                onBack={handleBackToStep1}
                selectedBrand={selectedBrand}
                accentColor={accentColor}
              />
            )}

            {/* Step 3: "¿Qué talla?" */}
            {step === 3 && selectedGender && (
              <Step2Size
                gender={selectedGender}
                availableSizes={availableSizes}
                selectedSize={selectedSize}
                lastRememberedSize={getLastSelectedSize()}
                onSelectSize={handleSelectSize}
                onBack={handleBackToStep2}
                accentColor={accentColor}
              />
            )}

            {/* Step 4: Product Cards (4 to 6 items) or No Stock Fallback */}
            {step === 4 && selectedGender && selectedSize && (
              <>
                {filteredProducts.length > 0 ? (
                  <Step3Products
                    products={filteredProducts}
                    gender={selectedGender}
                    size={selectedSize}
                    onSelectProduct={handleSelectProduct}
                    onBack={handleBackToStep3}
                    accentColor={accentColor}
                  />
                ) : (
                  <NoStockFallback
                    gender={selectedGender}
                    size={selectedSize}
                    zone={zoneParam}
                    campaignId={campaign.id}
                    onBack={handleBackToStep3}
                    accentColor={accentColor}
                  />
                )}
              </>
            )}

            {/* Step 5: Final Screen for Selected Product */}
            {step === 5 && selectedProduct && selectedSize && (
              <ProductDetail
                product={selectedProduct}
                selectedSize={selectedSize}
                campaign={campaign}
                zone={zoneParam}
                onBack={handleBackToStep4}
                accentColor={accentColor}
              />
            )}
          </>
        )}
      </main>

      {/* Interactive Testing & Campaign Simulator with 1-click preset walkthroughs */}
      <CampaignBar
        currentCampaignId={campaignParam}
        currentZone={zoneParam}
        onSwitchCampaign={handleSwitchCampaign}
        onAutoFillFlow={handleAutoFillFlow}
        onReset={handleReset}
      />

      {/* Live Telemetry and Firestore Event Tracker Drawer */}
      <TelemetryDrawer
        events={liveEvents}
        onClear={() => setLiveEvents([])}
        sessionId={sessionId}
      />
    </div>
  );
}
