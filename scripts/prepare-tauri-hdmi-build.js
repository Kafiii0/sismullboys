const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[Build] Building Next.js static export for HDMI Shield...');
execSync('npm run build', { stdio: 'inherit' });

const outDir = path.join(__dirname, '..', 'out');
const downloadsDir = path.join(outDir, 'downloads');

if (fs.existsSync(downloadsDir)) {
  console.log('[Build] Removing heavy zip files from out/downloads to optimize installer size...');
  fs.rmSync(downloadsDir, { recursive: true, force: true });
}

// Copy hdmi-desktop.html to index.html so Tauri window opens HDMI Shield directly
const hdmiHtml = path.join(outDir, 'hdmi-desktop.html');
const indexHtml = path.join(outDir, 'index.html');
if (fs.existsSync(hdmiHtml)) {
  console.log('[Build] Setting hdmi-desktop.html as default desktop view...');
  fs.copyFileSync(hdmiHtml, indexHtml);
}
console.log('[Build] Frontend prepared successfully for HDMI Shield!');

