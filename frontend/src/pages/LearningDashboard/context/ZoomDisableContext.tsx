import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface ZoomDisableContextType {
  isZoomDisabled: boolean;
  disableZoom: () => void;
  enableZoom: () => void;
}

const ZoomDisableContext = createContext<ZoomDisableContextType | undefined>(undefined);

export function ZoomDisableProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const disableZoom = useCallback(() => setCount((c) => c + 1), []);
  const enableZoom = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  return (
    <ZoomDisableContext.Provider value={{ isZoomDisabled: count > 0, disableZoom, enableZoom }}>
      {children}
    </ZoomDisableContext.Provider>
  );
}

export function useZoomDisable() {
  const ctx = useContext(ZoomDisableContext);
  if (!ctx) throw new Error('useZoomDisable must be used within ZoomDisableProvider');
  return ctx;
}
