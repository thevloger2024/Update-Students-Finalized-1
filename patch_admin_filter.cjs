const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

code = code.replace(
  /<option value="scholarship">{t\('scholarships'\)}<\/option>\n                    <\/select>/,
  '<option value="scholarship">{t(\'scholarships\')}</option>\n                      <option value="updates">{t(\'updates\') || \'Updates\'}</option>\n                    </select>'
);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
