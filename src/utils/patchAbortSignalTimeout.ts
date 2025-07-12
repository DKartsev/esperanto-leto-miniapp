export function patchAbortSignalTimeout(): void {
  if (typeof AbortSignal === 'undefined') {
    return;
  }

  const anyAbortSignal = AbortSignal as any;
  if (typeof anyAbortSignal.timeout === 'function') {
    try {
      // Ensure built-in implementation works with current timers
      anyAbortSignal.timeout(0);
      return;
    } catch {
      // fall through to polyfill if it throws
    }
  }

  // Polyfill AbortSignal.timeout for incompatible environments
  (AbortSignal as any).timeout = function (ms: number): AbortSignal {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    controller.signal.addEventListener('abort', () => clearTimeout(id));
    return controller.signal;
  };
}
