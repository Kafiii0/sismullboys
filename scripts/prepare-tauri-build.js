const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[Build] Building Next.js static export...');
execSync('npm run build', { stdio: 'inherit' });

const outDir = path.join(__dirname, '..', 'out');
const downloadsDir = path.join(outDir, 'downloads');

if (fs.existsSync(downloadsDir)) {
  console.log('[Build] Removing heavy zip files from out/downloads to optimize installer size...');
  fs.rmSync(downloadsDir, { recursive: true, force: true });
}

// Copy witness-desktop.html to index.html so Tauri window opens Witness Cam directly
const witnessHtml = path.join(outDir, 'witness-desktop.html');
const indexHtml = path.join(outDir, 'index.html');
if (fs.existsSync(witnessHtml)) {
  console.log('[Build] Setting witness-desktop.html as default desktop view...');
  fs.copyFileSync(witnessHtml, indexHtml);
}
console.log('[Build] Frontend prepared successfully for Tauri!');

