const fs = require('fs');
let code = fs.readFileSync('src/components/AdminJobDataManager.tsx', 'utf8');

code = code.replace(
  "job.category === 'direct' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'",
  "job.category === 'direct' ? 'bg-green-100 text-green-700' : job.category === 'interview' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
);

fs.writeFileSync('src/components/AdminJobDataManager.tsx', code);
