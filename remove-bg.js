const sharp = require('sharp');
const fs = require('fs');

const files = fs.readdirSync('assets').filter(f => f.toLowerCase().includes('logo'));
const logoFile = 'assets/' + files[0];
console.log('Processing:', logoFile);

sharp(logoFile)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    const { width, height, channels } = info;
    for (let i = 0; i < width * height; i++) {
      const r = data[i * channels];
      const g = data[i * channels + 1];
      const b = data[i * channels + 2];
      if (r > 220 && g > 220 && b > 220) {
        data[i * channels + 3] = 0;
      }
    }
    return sharp(Buffer.from(data), {
      raw: { width, height, channels }
    }).png().toFile('assets/logo-clean.png');
  })
  .then(() => console.log('Logo nettoyé : assets/logo-clean.png'));
