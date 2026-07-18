const fs = require('fs');

let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('overflow-x: hidden')) {
  code = code.replace(
    'body {\n  background-color',
    'body {\n  overflow-x: hidden;\n  background-color'
  );
  fs.writeFileSync('src/index.css', code);
}
