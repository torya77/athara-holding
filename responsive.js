const sharp = require('sharp');
const files = ['mercedes', 'digital', 'commerce', 'immo'];
async function responsive() {
  for (const f of files) {
    await sharp(`assets/${f}-opt.webp`)
      .resize(700, 394, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(`assets/${f}-sm.webp`);
    console.log(`${f}-sm.webp créé`);
  }
}
responsive().catch(console.error);
