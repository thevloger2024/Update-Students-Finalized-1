const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

code = code.replace(
  "type: 'job' | 'admit_card' | 'result' | 'scholarship';",
  "type: 'job' | 'admit_card' | 'result' | 'scholarship' | 'updates';"
);

code = code.replace(
  '<option value="scholarship">{t(\'scholarships\')}</option>',
  '<option value="scholarship">{t(\'scholarships\')}</option>\n                      <option value="updates">{t(\'updates\') || \'Updates\'}</option>'
);

code = code.replace(
  '<option value="scholarship">{t(\'scholarships\')}</option>',
  '<option value="scholarship">{t(\'scholarships\')}</option>\n                      <option value="updates">{t(\'updates\') || \'Updates\'}</option>'
);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
