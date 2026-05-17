// Auto-read version from package.json at build time (Vite JSON import)
import pkg from '../../package.json';
export const APP_VERSION = `v${pkg.version}`;
