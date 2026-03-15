import {defineConfig} from 'vite';
import mc from '@motion-canvas/vite-plugin';

// Handle double-default CJS/ESM interop
const motionCanvas = typeof mc === 'function' ? mc : (mc as any).default;

export default defineConfig({
  plugins: [
    motionCanvas(),
  ],
});
