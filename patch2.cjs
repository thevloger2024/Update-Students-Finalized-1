const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminFeaturesPage.tsx', 'utf8');

if (!code.includes('AdminGuidesManager')) {
  code = code.replace(
    "import { MessageManager } from '../components/MessageManager';",
    "import { MessageManager } from '../components/MessageManager';\nimport { AdminGuidesManager } from '../components/AdminGuidesManager';\nimport { BookOpen } from 'lucide-react';"
  );
}

const targetFeatures = `    {
      id: 'users',`;
      
const replacementFeatures = `    {
      id: 'guides',
      title: 'Job Guides & Tips',
      description: 'Manage static articles, PDF guides, and study tips.',
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      status: "Active"
    },
    {
      id: 'users',`;

code = code.replace(targetFeatures, replacementFeatures);

const targetRender = `) : activeFeature === 'system' ? (
          <SystemSettingsManager />`;
          
const replacementRender = `) : activeFeature === 'guides' ? (
          <AdminGuidesManager />
        ) : activeFeature === 'system' ? (
          <SystemSettingsManager />`;
          
code = code.replace(targetRender, replacementRender);

fs.writeFileSync('src/pages/AdminFeaturesPage.tsx', code);
