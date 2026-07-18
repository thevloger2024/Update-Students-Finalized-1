const fs = require('fs');
let code = fs.readFileSync('src/components/UpdateSection.tsx', 'utf8');

code = code.replace(
  "type: 'job' | 'admit_card' | 'result' | 'scholarship';",
  "type: 'job' | 'admit_card' | 'result' | 'scholarship' | 'updates';"
);

fs.writeFileSync('src/components/UpdateSection.tsx', code);
