const fs = require('fs');
const path = require('path');

async function downloadAirbus() {
  const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Airbus_Logo_2017.svg/800px-Airbus_Logo_2017.svg.png';
  console.log('Downloading official Airbus logo from:', url);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'PROMETHEUS-Cybersecurity-ClientLogoFetcher/1.0 (https://prometheus.co.id; contact@prometheus.co.id)' }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const dest = path.join(__dirname, '../public/clients/airbus.png');
  fs.writeFileSync(dest, buffer);
  console.log(`Saved official Airbus logo to ${dest} (${buffer.length} bytes)`);
}

downloadAirbus().catch(console.error);
