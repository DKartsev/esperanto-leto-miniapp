export function patchAbortSignalTimeout(): void {
  if (typeof AbortSignal === 'undefined') {
    return;
  }

  try {
    // Test existing implementation in case it throws
    if (typeof (AbortSignal as any).timeout === 'function') {
      (AbortSignal as any).timeout(0);
      return;
    }
  } catch {
    // fall through to polyfill
  }

  // Polyfill AbortSignal.timeout for incompatible environments
  (AbortSignal as any).timeout = function (ms: number): AbortSignal {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    controller.signal.addEventListener('abort', () => clearTimeout(id));
    return controller.signal;
  };
}
