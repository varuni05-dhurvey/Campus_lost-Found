import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rollupNativePath = path.join(__dirname, 'node_modules/rollup/dist/native.js');

if (fs.existsSync(rollupNativePath)) {
  let content = fs.readFileSync(rollupNativePath, 'utf8');
  if (!content.includes("@rollup/wasm-node")) {
    content = content.replace(
      /const nativeModule = requireWithFriendlyError\([\s\S]*?\);/,
      `let nativeModule;
try {
  nativeModule = require(existsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`);
} catch (e) {
  nativeModule = require('@rollup/wasm-node');
}`
    );
    fs.writeFileSync(rollupNativePath, content, 'utf8');
    console.log('[Setup] Rollup wasm fallback successfully applied.');
  }
}
