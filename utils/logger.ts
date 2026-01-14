/**
 * Centralized Logger Utility
 * Handles environment-aware logging to prevent sensitive data exposure in production
 */

const isDev = __DEV__;

export const logger = {
    log: (message: string, ...args: any[]) => {
        if (isDev) {
            console.log(`[LOG] ${message}`, ...args);
        }
    },

    info: (message: string, ...args: any[]) => {
        if (isDev) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },

    warn: (message: string, ...args: any[]) => {
        // Warnings are kept in production for remote debugging if needed
        console.warn(`[WARN] ${message}`, ...args);
    },

    error: (message: string, ...args: any[]) => {
        // Errors are ALWAYS logged
        console.error(`[ERROR] ${message}`, ...args);
    },

    debug: (message: string, ...args: any[]) => {
        if (isDev) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
};

export default logger;
