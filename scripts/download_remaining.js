const fs = require('fs');
const path = require('path');
const https = require('https');

const userAgent = 'PROMETHEUS-Cybersecurity-ClientLogoFetcher/1.0 (contact@prometheus.co.id)';

const items = [
  {
    name: 'mahkamah_agung.png',
    api: 'https://id.wikipedia.org/w/api.php?action=query&titles=Berkas:Logo%20Mahkamah%20Agung%20RI.png&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json'
  },
  {
    name: 'caltech.png',
    api: 'https://en.wikipedia.org/w/api.php?action=query&titles=File:Caltech%20Logo.svg&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json'
  },
  {
    name: 'airbus.png',
    api: 'https://en.wikipedia.org/w/api.php?action=query&titles=File:Airbus%201970%E2%80%932010%20logo.svg&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json'
  }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
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
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
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
  const destDir = path.join(__dirname, '..', 'public', 'clients');

  for (const item of items) {
    try {
      const data = await fetchJson(item.api);
      const pages = data.query.pages;
      let imgUrl = null;
      for (const pid in pages) {
        const info = pages[pid].imageinfo;
        if (info && info[0]) {
          imgUrl = info[0].thumburl || info[0].url;
        }
      }
      if (!imgUrl) {
        console.error(`Could not find URL for ${item.name}`);
        continue;
      }
      console.log(`Downloading ${item.name} from ${imgUrl}...`);
      const dest = path.join(destDir, item.name);
      const size = await downloadImage(imgUrl, dest);
      console.log(`SUCCESS: ${item.name} downloaded (${size} bytes)`);
    } catch (err) {
      console.error(`ERROR for ${item.name}:`, err.message);
    }
  }
}

run();
