const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminFeaturesPage.tsx', 'utf8');

if (!code.includes('import { Briefcase }') && !code.includes('Briefcase, ')) {
  code = code.replace("BookOpen } from 'lucide-react'", "BookOpen, Briefcase } from 'lucide-react'");
  fs.writeFileSync('src/pages/AdminFeaturesPage.tsx', code);
}
