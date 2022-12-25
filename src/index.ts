import { Client } from './client';

export * from './enums';
export * from './models';

export { Client };

export interface LoggerFunc {
    (lvl: 'debug' | 'info' | 'warn' | 'error', msg: string, meta?: object): void;
}

// Set AdzerkDecisionSdk as the global name for the clientSideApp (browser) build
declare global {
    var AdzerkDecisionSdk: object;
}
globalThis.AdzerkDecisionSdk = exports;
