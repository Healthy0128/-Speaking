import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function fixPiperWasm() {
  return {
    name: 'fix-piper-wasm-paths',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('@mintplex-labs/piper-tts-web')) return null;
      const patched = code.replaceAll(
        'https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/',
        '/-Speaking/ort/'
      );
      return patched === code ? null : { code: patched, map: null };
    },
    generateBundle() {
      const dir = path.resolve('node_modules/onnxruntime-web/dist');
      if (!fs.existsSync(dir)) throw new Error('onnxruntime-web/dist is missing');
      for (const name of fs.readdirSync(dir)) {
        if (!/^ort-wasm.*\.(wasm|mjs)$/.test(name)) continue;
        this.emitFile({ type: 'asset', fileName: 'ort/' + name, source: fs.readFileSync(path.join(dir, name)) });
      }
    },
  };
}
export default defineConfig({
  base: '/-Speaking/',
  plugins: [fixPiperWasm()],
  build: { target: 'es2022' }
});
