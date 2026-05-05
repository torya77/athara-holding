const sharp = require('sharp');
const files = ['mercedes','digital','commerce','immo'];
async function fix() {
  for (const f of files) {
    await sharp(`assets/${f}-opt.webp`)
      .resize(662, 372, { fit: 'cover' })
      .webp({ quality: 65 })
      .toFile(`assets/${f}-sm.webp`);
    console.log(`${f}-sm.webp recréé`);
  }
}
fix();
