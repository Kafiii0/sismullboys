const fs = require('fs');
const path = require('path');
const https = require('https');

const userAgent = 'PROMETHEUS-Cybersecurity-ClientLogoFetcher/1.0 (https://prometheus.co.id; contact@prometheus.co.id)';

const targets = [
  { key: 'nasa', query: 'File:NASA logo.svg', wiki: 'commons' },
  { key: 'airbus', query: 'File:Airbus logo 2017.svg', wiki: 'commons' },
  { key: 'mahkamah_agung', query: 'File:Seal of the Supreme Court of the Republic of Indonesia.svg', wiki: 'commons' },
  { key: 'jateng', query: 'File:Coat of arms of Central Java.svg', wiki: 'commons' },
  { key: 'sumut', query: 'File:Coat of arms of North Sumatra.svg', wiki: 'commons' },
  { key: 'caltech', query: 'File:California Institute of Technology seal.svg', wiki: 'commons' },
  { key: 'usu', query: 'File:Logo of North Sumatra University.svg', wiki: 'commons' },
  { key: 'telkom_univ', query: 'File:Logo Telkom University potrait.png', wiki: 'commons' }
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

async function searchFallback(term) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=6&format=json`;
  const res = await fetchJson(url);
  if (res.query && res.query.search && res.query.search.length > 0) {
    return res.query.search[0].title;
  }
  return null;
}

async function getImageUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
  const res = await fetchJson(url);
  const pages = res.query.pages;
  for (const pid in pages) {
    const info = pages[pid].imageinfo;
    if (info && info[0]) {
      return info[0].thumburl || info[0].url;
    }
  }
  return null;
}

async function run() {
  const outDir = path.join(__dirname, '..', 'public', 'clients');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const t of targets) {
    console.log(`Processing ${t.key}...`);
    let title = t.query;
    let imgUrl = await getImageUrl(title);

    if (!imgUrl) {
      console.log(`Direct title not found, searching fallback for: ${t.key}`);
      const fallbackTitle = await searchFallback(t.key.replace('_', ' '));
      if (fallbackTitle) {
        console.log(`Found fallback title: ${fallbackTitle}`);
        imgUrl = await getImageUrl(fallbackTitle);
      }
    }

    if (imgUrl) {
      const dest = path.join(outDir, `${t.key}.png`);
      try {
        const size = await downloadImage(imgUrl, dest);
        console.log(`SUCCESS: ${t.key}.png (${size} bytes) from ${imgUrl}`);
      } catch (err) {
        console.error(`ERROR downloading ${t.key}:`, err.message);
      }
    } else {
      console.error(`FAILED to find image URL for ${t.key}`);
    }
  }
}

run();
