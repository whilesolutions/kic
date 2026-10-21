import { TelemetryEvent, EventType } from '../types';

const SESSION_KEY = 'ko_anon_session_id';
const LAST_SIZE_KEY = 'ko_last_size_selected';

export function getOrCreateSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 's_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 's_fallback_' + Math.random().toString(36).substring(2, 10);
  }
}

export function saveLastSelectedSize(size: string): void {
  try {
    localStorage.setItem(LAST_SIZE_KEY, size);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function getLastSelectedSize(): string | null {
  try {
    return localStorage.getItem(LAST_SIZE_KEY);
  } catch {
    return null;
  }
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);

  let type = 'desktop';
  if (isTablet) type = 'tablet';
  else if (isMobile) type = 'mobile';

  return {
    type,
    screen: `${window.innerWidth}x${window.innerHeight}`,
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}

// Queue and debounce events to avoid spamming the connection
class TelemetryManager {
  private queue: TelemetryEvent[] = [];
  private isFlushing = false;
  private currentCampaign = 'default';
  private currentZone = 'ccs';
  private listeners: ((event: TelemetryEvent) => void)[] = [];

  public onEvent(callback: (event: TelemetryEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public setContext(campaign: string, zone: string) {
    this.currentCampaign = campaign;
    this.currentZone = zone;
  }

  public track(eventType: EventType, details?: Record<string, string | number | boolean>) {
    const event: TelemetryEvent = {
      sessionId: getOrCreateSessionId(),
      campaign: this.currentCampaign,
      zone: this.currentZone,
      eventType,
      device: getDeviceInfo(),
      details: details || {},
      createdAt: new Date().toISOString(),
    };

    // Notify live UI listeners
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch {
        // Safe ignore
      }
    });

    this.queue.push(event);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.isFlushing) return;
    setTimeout(() => {
      this.flush();
    }, 120);
  }

  private async flush() {
    if (this.queue.length === 0) return;
    this.isFlushing = true;
    const batch = [...this.queue];
    this.queue = [];

    for (const event of batch) {
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          keepalive: true,
        });
      } catch (err) {
        console.warn('Telemetry event dispatch non-blocking error', err);
      }
    }
    this.isFlushing = false;
  }
}

export const telemetry = new TelemetryManager();

// Setup rage click and scroll depth tracking
export function initInteractionTelemetry(campaign: string, zone: string) {
  telemetry.setContext(campaign, zone);

  // Rage Click Detector (3+ clicks within 600ms in a 30px radius)
  let clickCount = 0;
  let lastClickTime = 0;
  let lastX = 0;
  let lastY = 0;

  const handleClick = (e: MouseEvent) => {
    const now = Date.now();
    const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);

    if (now - lastClickTime < 600 && distance < 40) {
      clickCount++;
      if (clickCount >= 3) {
        telemetry.track('rage_click', {
          targetTag: (e.target as HTMLElement)?.tagName?.toLowerCase() || 'unknown',
          targetClass: (e.target as HTMLElement)?.className?.toString().slice(0, 50) || '',
        });
        clickCount = 0;
      }
    } else {
      clickCount = 1;
    }

    lastClickTime = now;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  window.addEventListener('click', handleClick, { passive: true });

  // Scroll Depth Detector (25%, 50%, 75%, 100%)
  const trackedDepths = new Set<number>();
  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);

    const checkpoints = [25, 50, 75, 100];
    for (const cp of checkpoints) {
      if (scrollPercentage >= cp && !trackedDepths.has(cp)) {
        trackedDepths.add(cp);
        telemetry.track('scroll_depth', { depthPercent: cp });
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    window.removeEventListener('click', handleClick);
    window.removeEventListener('scroll', handleScroll);
  };
}
