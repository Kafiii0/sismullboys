const fs = require('fs');
const path = require('path');
const https = require('https');

const clients = [
  {
    name: 'nasa.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/800px-NASA_logo.svg.png'
  },
  {
    name: 'airbus.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Airbus_logo_2017.svg/800px-Airbus_logo_2017.svg.png'
  },
  {
    name: 'caltech.png',
    url: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Seal_of_the_California_Institute_of_Technology.svg/800px-Seal_of_the_California_Institute_of_Technology.svg.png'
  },
  {
    name: 'mahkamah_agung.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Seal_of_the_Supreme_Court_of_the_Republic_of_Indonesia.svg/800px-Seal_of_the_Supreme_Court_of_the_Republic_of_Indonesia.svg.png'
  },
  {
    name: 'jateng.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Coat_of_arms_of_Central_Java.svg/800px-Coat_of_arms_of_Central_Java.svg.png'
  },
  {
    name: 'sumut.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Coat_of_arms_of_North_Sumatra.svg/800px-Coat_of_arms_of_North_Sumatra.svg.png'
  },
  {
    name: 'telkom_univ.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Logo_Telkom_University_potrait.png/800px-Logo_Telkom_University_potrait.png'
  },
  {
    name: 'usu.png',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Logo_of_North_Sumatra_University.svg/800px-Logo_of_North_Sumatra_University.svg.png'
  }
];

const destDir = path.join(__dirname, '..', 'public', 'clients');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadFile(item) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(destDir, item.name);
    const file = fs.createWriteStream(filePath);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    https.get(item.url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, options, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${item.name} (${fs.statSync(filePath).size} bytes)`);
            resolve();
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${item.name} (${fs.statSync(filePath).size} bytes)`);
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${item.name}, status code: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  for (const item of clients) {
    try {
      await downloadFile(item);
    } catch (err) {
      console.error(err.message);
    }
  }
}

run();
