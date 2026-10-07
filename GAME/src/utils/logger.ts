/**
 * Debug logging that disappears from production builds and test runs.
 * Errors and warnings keep using console.error / console.warn directly.
 */
const enabled = import.meta.env.DEV && import.meta.env.MODE !== 'test';

export const debugLog = (...args: unknown[]): void => {
    if (enabled) console.log(...args);
};
