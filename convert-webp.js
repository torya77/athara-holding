const sharp = require('sharp');

const jpgs = ['mercedes', 'digital', 'commerce', 'immo'];
jpgs.forEach(f => {
  sharp(`assets/${f}.jpg`)
    .webp({ quality: 85 })
    .toFile(`assets/${f}.webp`)
    .then(() => console.log(`${f}.webp créé`))
    .catch(console.error);
});

sharp('assets/logo-clean.png')
  .webp({ quality: 90, lossless: false })
  .toFile('assets/logo-clean.webp')
  .then(() => console.log('logo-clean.webp créé'))
  .catch(console.error);
