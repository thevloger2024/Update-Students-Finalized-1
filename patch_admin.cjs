const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminFeaturesPage.tsx', 'utf8');

if (!code.includes('AdminJobDataManager')) {
  code = code.replace(
    "import { AdminGuidesManager } from '../components/AdminGuidesManager';",
    "import { AdminGuidesManager } from '../components/AdminGuidesManager';\nimport { AdminJobDataManager } from '../components/AdminJobDataManager';"
  );
  
  if (code.includes('import { Briefcase }')) {
    // already there
  } else {
    code = code.replace(
      "import { ArrowLeft, BookOpen,",
      "import { ArrowLeft, BookOpen, Briefcase,"
    );
  }

  const targetFeatures = `    {
      id: 'guides',`;
      
  const replacementFeatures = `    {
      id: 'jobdata',
      title: 'Job Data Manager',
      description: 'Manage dynamic jobs list for the job guide view.',
      icon: Briefcase,
      color: "bg-indigo-50 text-indigo-600",
      status: "Active"
    },
    {
      id: 'guides',`;

  code = code.replace(targetFeatures, replacementFeatures);

  const targetRender = `) : activeFeature === 'guides' ? (`;
          
  const replacementRender = `) : activeFeature === 'jobdata' ? (
          <AdminJobDataManager />
        ) : activeFeature === 'guides' ? (`;
          
  code = code.replace(targetRender, replacementRender);

  fs.writeFileSync('src/pages/AdminFeaturesPage.tsx', code);
}
