const sharp = require('sharp');

const svg = `<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <circle cx="96" cy="96" r="96" fill="#0a0a0a"/>
  <text
    x="96" y="150"
    font-family="Georgia, serif"
    font-size="150"
    font-weight="bold"
    fill="#c9a84c"
    text-anchor="middle">A</text>
</svg>`;

const buf = Buffer.from(svg);

async function go() {
  await sharp(buf).resize(32,  32 ).png().toFile('assets/favicon-32x32.png');
  await sharp(buf).resize(16,  16 ).png().toFile('assets/favicon-16x16.png');
  await sharp(buf).resize(180, 180).png().toFile('assets/apple-touch-icon.png');
  await sharp(buf).resize(32,  32 ).png().toFile('assets/favicon.ico');
  console.log('Done');
}
go();
