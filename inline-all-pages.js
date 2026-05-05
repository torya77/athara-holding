const fs = require('fs');
const css = fs.readFileSync('css/style.min.css', 'utf8');
const pages = ['index', 'about', 'divisions', 'contact'];
const oldStyle = /<style>[^<]{500,}<\/style>\s*<link rel="stylesheet" href="css\/style\.min\.css">|<style>[^<]{500,}<\/style>\s*<style>[^<]{5000,}<\/style>/s;

pages.forEach(page => {
  let html = fs.readFileSync(`${page}.html`, 'utf8');
  // Replace the full inlined CSS block (the large one) with a fresh one
  // Find and replace just the big style block that came from style.min.css
  const bigStyleRegex = /<style>@keyframes[\s\S]*?<\/style>/;
  if (bigStyleRegex.test(html)) {
    html = html.replace(bigStyleRegex, `<style>${css}</style>`);
    fs.writeFileSync(`${page}.html`, html);
    console.log(`CSS mis à jour dans ${page}.html`);
  } else {
    console.log(`Pas de bloc CSS trouvé dans ${page}.html`);
  }
});
