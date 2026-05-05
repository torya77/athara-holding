const sharp = require('sharp');

async function compress() {
  const heroFiles = ['mercedes', 'digital', 'commerce', 'immo'];
  for (const f of heroFiles) {
    await sharp(`assets/${f}.webp`)
      .resize(1200, 675, { fit: 'cover' })
      .webp({ quality: 75, effort: 6 })
      .toFile(`assets/${f}-opt.webp`);
    console.log(`${f}-opt.webp créé`);
  }
  await sharp('assets/logo-clean.webp')
    .resize(200, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile('assets/logo-opt.webp');
  console.log('logo-opt.webp créé');
}
compress().catch(console.error);
