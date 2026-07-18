const fs = require('fs');
let code = fs.readFileSync('src/pages/CategoryPage.tsx', 'utf8');

code = code.replace(
  "const { type } = useParams<{ type: 'job' | 'admit_card' | 'result' | 'scholarship' }>();",
  "const { type } = useParams<{ type: 'job' | 'admit_card' | 'result' | 'scholarship' | 'updates' }>();"
);

code = code.replace(
  "    scholarship: t('scholarships')",
  "    scholarship: t('scholarships'),\n    updates: t('latestUpdates') || 'Latest Updates'"
);

fs.writeFileSync('src/pages/CategoryPage.tsx', code);
