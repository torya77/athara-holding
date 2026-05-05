const sharp = require('sharp');
const fs = require('fs');

function pngToIco(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

async function makeIcon(symbolBuffer, canvasSize, symbolSize, outFile) {
  const resized = await sharp(symbolBuffer)
    .resize(symbolSize, symbolSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: canvasSize, height: canvasSize, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 255 } }
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toFile(outFile);

  console.log(`Created ${outFile}`);
}

async function run() {
  // 1. Trim transparent border around entire logo
  const trimmed = await sharp('assets/logo-clean.png').trim().toBuffer();
  const meta = await sharp(trimmed).metadata();
  console.log('Trimmed dimensions:', meta.width, 'x', meta.height);

  // 2. Crop top 55% (symbol only, no text)
  const cropped = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: meta.width, height: Math.floor(meta.height * 0.55) })
    .toBuffer();

  // 3. Trim again to remove transparent padding around symbol
  const symbol = await sharp(cropped).trim().toBuffer();
  const symMeta = await sharp(symbol).metadata();
  console.log('Symbol dimensions:', symMeta.width, 'x', symMeta.height);

  await makeIcon(symbol, 192, 160, 'assets/apple-touch-icon.png');
  await makeIcon(symbol, 32,  26,  'assets/favicon-32x32.png');
  await makeIcon(symbol, 16,  13,  'assets/favicon-16x16.png');

  const png32 = fs.readFileSync('assets/favicon-32x32.png');
  fs.writeFileSync('assets/favicon.ico', pngToIco(png32));
  console.log('Created assets/favicon.ico');
}

run().catch(console.error);
