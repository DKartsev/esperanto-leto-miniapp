/**
 * Simple logger utility for the Telegram bot
 */
export const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp}: ${message}`);
    if (data) {
      console.log('[INFO] Data:', data);
    }
  },
  
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp}: ${message}`);
    if (data) {
      console.warn('[WARN] Data:', data);
    }
  },
  
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp}: ${message}`);
    if (error) {
      console.error('[ERROR] Details:', error);
      if (error.stack) {
        console.error('[ERROR] Stack:', error.stack);
      }
    }
  },
  
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[DEBUG] ${timestamp}: ${message}`);
      if (data) {
        console.debug('[DEBUG] Data:', data);
      }
    }
  }
};