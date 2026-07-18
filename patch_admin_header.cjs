const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

code = code.replace(
  'className="flex items-center gap-3 mb-8"',
  'className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-3 mb-8"'
);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
