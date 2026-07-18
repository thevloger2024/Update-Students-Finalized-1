const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  'const latestUpdates = filteredUpdates.slice(0, 8);',
  "const latestUpdates = filteredUpdates.filter((u) => u.type === 'updates');"
);

fs.writeFileSync('src/pages/Home.tsx', code);
