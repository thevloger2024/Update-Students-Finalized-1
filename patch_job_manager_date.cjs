const fs = require('fs');

let code = fs.readFileSync('src/components/AdminJobDataManager.tsx', 'utf8');

code = code.replace(
  "createdAt?: string;",
  "createdAt?: string;\n  updatedAt?: string;"
);

code = code.replace(
  "createdAt: currentJob.createdAt || new Date().toISOString()",
  "createdAt: currentJob.createdAt || new Date().toISOString(),\n        updatedAt: new Date().toISOString()"
);

fs.writeFileSync('src/components/AdminJobDataManager.tsx', code);
