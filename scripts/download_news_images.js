const fs = require('fs');
const path = require('path');
const https = require('https');

const userAgent = 'PROMETHEUS-Cybersecurity-Bot/1.0 (contact@prometheus.co.id)';

const articles = [
  {
    name: 'quantum_crypto.jpg',
    title: 'File:Wire Bonded Superconducting Quantum Chip with 6 Transmons 001.png'
  },
  {
    name: 'cloud_soc.jpg',
    title: 'File:DALL·E 2025-01-31 21.58.22 - A realistic image of the interior of a modern data center. The scene features long rows of tall, sleek server racks filled with blinking LED lights. T.webp'
  },
  {
    name: 'cyber_defense.jpg',
    title: 'File:Spangdahlem AB becomes first DoD installation to implement BlastWave cyber security solution (8296220).jpg'
  }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(fs.statSync(destPath).size);
      });
    }).on('error', reject);
  });
}

async function run() {
  const destDir = path.join(__dirname, '..', 'public', 'news');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  for (const art of articles) {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(art.title)}&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json`;
    const data = await fetchJson(apiUrl);
    const pages = data.query.pages;
    let imgUrl = null;
    for (const pid in pages) {
      const info = pages[pid].imageinfo;
      if (info && info[0]) {
        imgUrl = info[0].thumburl || info[0].url;
      }
    }
    if (imgUrl) {
      const dest = path.join(destDir, art.name);
      const size = await downloadImage(imgUrl, dest);
      console.log(`Downloaded ${art.name} (${size} bytes) from ${imgUrl}`);
    } else {
      console.error(`Failed to find URL for ${art.name}`);
    }
  }
}

run();
