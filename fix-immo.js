const sharp = require('sharp');
sharp('assets/immo-opt.webp')
  .resize(662, 372, { fit: 'cover' })
  .webp({ quality: 55 })
  .toFile('assets/immo-sm.webp')
  .then(() => console.log('immo-sm recréé'));
