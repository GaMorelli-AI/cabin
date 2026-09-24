import { useEffect } from "react";

const CURSOR_IDLE_TIMEOUT = 3000;

/**
 * Locks down browser chrome behaviors that don't belong on a kiosk totem:
 * hides the cursor after a few seconds of inactivity, blocks the context
 * menu, and blocks pinch-zoom / double-tap-zoom gestures. Selection and
 * scroll are blocked via CSS (see index.css) since that covers more cases
 * with less risk of breaking normal taps.
 */
export function useKioskMode() {
  useEffect(() => {
    let idleTimer: number | null = null;

    const showCursor = () => {
      document.body.classList.remove("kiosk-cursor-hidden");
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        document.body.classList.add("kiosk-cursor-hidden");
      }, CURSOR_IDLE_TIMEOUT);
    };

    const preventContextMenu = (event: Event) => event.preventDefault();

    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) event.preventDefault();
      lastTouchEnd = now;
    };

    showCursor();
    window.addEventListener("mousemove", showCursor);
    window.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("touchmove", preventMultiTouch, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });

    return () => {
      if (idleTimer !== null) window.clearTimeout(idleTimer);
      window.removeEventListener("mousemove", showCursor);
      window.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("touchmove", preventMultiTouch);
      document.removeEventListener("touchend", preventDoubleTapZoom);
      document.body.classList.remove("kiosk-cursor-hidden");
    };
  }, []);
}
