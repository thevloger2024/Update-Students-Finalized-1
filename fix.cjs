const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminFeaturesPage.tsx', 'utf8');

if (!code.includes('import { AdminGuidesManager }')) {
  code = "import { AdminGuidesManager } from '../components/AdminGuidesManager';\n" + code;
}

if (code.includes("icon: BookOpen,")) {
  if (!code.includes("import { BookOpen")) {
    code = code.replace(
      "import { ArrowLeft,",
      "import { ArrowLeft, BookOpen,"
    );
  }
}

fs.writeFileSync('src/pages/AdminFeaturesPage.tsx', code);
