const fs = require('fs');

const path = '.github/workflows/firebase-hosting-merge.yml';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "run: npm ci",
  "run: npm install"
);

fs.writeFileSync(path, code);
