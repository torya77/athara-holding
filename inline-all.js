const fs = require('fs');
const css = fs.readFileSync('css/style.min.css', 'utf8');
['about','divisions','contact'].forEach(page => {
  let html = fs.readFileSync(`${page}.html`, 'utf8');
  html = html.replace(
    '<link rel="stylesheet" href="css/style.min.css">',
    `<style>${css}</style>`
  );
  fs.writeFileSync(`${page}.html`, html);
  console.log(`CSS inliné dans ${page}.html`);
});
