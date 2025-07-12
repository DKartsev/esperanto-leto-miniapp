export function patchAbortSignalTimeout(): void {
  if (typeof AbortSignal === 'undefined') {
    return;
  }

  const anyAbortSignal = AbortSignal as any;
  if (typeof anyAbortSignal.timeout === 'function') {
    // Environment already supports AbortSignal.timeout
    return;
  }

  // Polyfill AbortSignal.timeout for incompatible environments
  (AbortSignal as any).timeout = function (ms: number): AbortSignal {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    controller.signal.addEventListener('abort', () => clearTimeout(id));
    return controller.signal;
  };
}
