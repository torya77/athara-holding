const fs = require('fs');
const css = fs.readFileSync('css/style.min.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const updated = html.replace(
  '<link rel="stylesheet" href="css/style.min.css">',
  `<style>${css}</style>`
);
fs.writeFileSync('index.html', updated);
console.log('CSS inliné dans index.html');
