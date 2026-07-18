const fs = require('fs');
let code = fs.readFileSync('src/components/UpdateCard.tsx', 'utf8');

code = code.replace(
  "type: 'job' | 'admit_card' | 'result' | 'scholarship';",
  "type: 'job' | 'admit_card' | 'result' | 'scholarship' | 'updates';"
);

fs.writeFileSync('src/components/UpdateCard.tsx', code);
