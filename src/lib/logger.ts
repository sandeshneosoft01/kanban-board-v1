/**
 * A logger utility that wraps the browser's console methods.
 * In production mode, all console outputs are disabled to maintain clean production logs
 * and prevent potentially sensitive information from being exposed.
 */

const isProd = import.meta.env.PROD;

export const logger = {
  log: (...args: any[]) => {
    if (!isProd) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (!isProd) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (!isProd) {
      console.error(...args);
    }
  },
  info: (...args: any[]) => {
    if (!isProd) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (!isProd) {
      console.debug(...args);
    }
  },
};
