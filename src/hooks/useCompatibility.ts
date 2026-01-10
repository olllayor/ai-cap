import { useState, useEffect } from 'react';

export interface CompatibilityStatus {
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
  checking: boolean;
}

export function useCompatibility(): CompatibilityStatus {
  const [status, setStatus] = useState<CompatibilityStatus>({
    isCompatible: true,
    issues: [],
    warnings: [],
    checking: true,
  });

  useEffect(() => {
    const checkCompatibility = async () => {
      const issues: string[] = [];
      const warnings: string[] = [];

      // 1. Check WebAssembly support
      if (typeof WebAssembly === 'undefined') {
        issues.push('WebAssembly is not supported in this browser.');
      }

      // 2. Check SharedArrayBuffer support (Critical for ffmpeg.wasm)
      if (typeof SharedArrayBuffer === 'undefined') {
        issues.push(
          'SharedArrayBuffer is not available. This is required for video processing. ' +
          'Please ensure you are using a modern browser and the site is served in a secure context (HTTPS) ' +
          'with proper COOP/COEP headers.'
        );
      }

      // 3. Check Web Workers
      if (typeof Worker === 'undefined') {
        issues.push('Web Workers are not supported in this browser.');
      }

      // 4. Check IndexedDB key features
      if (!('indexedDB' in window)) {
        issues.push('IndexedDB is not supported. We need it to cache AI models.');
      }

      // 5. Check Device Memory (Warning only)
      // @ts-ignore - deviceMemory is non-standard but supported in Chrome
      const deviceMemory = navigator.deviceMemory;
      if (deviceMemory && deviceMemory < 4) {
        warnings.push(
          `Your device appears to have low memory (~${deviceMemory}GB). ` +
          'Video processing might be slow or unstable.'
        );
      }

      // 6. Check for mobile (Warning mainly for performance)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // We don't block mobile, but it's good to track/warn if needed later
        // warnings.push('Mobile devices might have limited processing power for heavy video tasks.');
      }

      setStatus({
        isCompatible: issues.length === 0,
        issues,
        warnings,
        checking: false,
      });
    };

    checkCompatibility();
  }, []);

  return status;
}
