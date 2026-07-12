const fs = require('fs');

let code = fs.readFileSync('src/components/AdminJobDataManager.tsx', 'utf8');

code = code.replace(
  "category: 'direct' | 'interview';",
  "category: 'direct' | 'interview' | 'exams';"
);

code = code.replace(
  "onChange={(e) => setCurrentJob({ ...currentJob, category: e.target.value as 'direct' | 'interview' })}",
  "onChange={(e) => setCurrentJob({ ...currentJob, category: e.target.value as 'direct' | 'interview' | 'exams' })}"
);

code = code.replace(
  `<option value="interview">Interview Only</option>`,
  `<option value="interview">Interview Only</option>
              <option value="exams">Basic Exams</option>`
);

code = code.replace(
  `{job.category === 'direct' ? 'Direct Recruitment' : 'Interview Only'}`,
  `{job.category === 'direct' ? 'Direct Recruitment' : job.category === 'interview' ? 'Interview Only' : 'Basic Exams'}`
);

fs.writeFileSync('src/components/AdminJobDataManager.tsx', code);
