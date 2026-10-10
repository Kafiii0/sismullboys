process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const path = require('path');

async function downloadFile(url, dest) {
  console.log(`Downloading ${url} -> ${dest}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
  console.log(`Saved ${dest} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  try {
    await downloadFile(
      'https://static.ptsecurity.com/uploads/files/PT_3840_no_Loss_0000_0210_2865297c9c.mp4',
      path.join(__dirname, '../public/video/hero_bg.mp4')
    );
    await downloadFile(
      'https://storage.yandexcloud.net/static.ptsecurity.com/uploads/files/PT_1920_no_Loss_0000_0210_10_20e4d25358.webp',
      path.join(__dirname, '../public/video/hero_poster.webp')
    );
    console.log('SUCCESS! Both video and poster downloaded.');
  } catch (err) {
    console.error('Error downloading:', err);
  }
}

main();
