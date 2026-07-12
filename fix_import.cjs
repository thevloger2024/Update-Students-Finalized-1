const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminFeaturesPage.tsx', 'utf8');

code = code.replace("} , BookOpen }", ", BookOpen }");

fs.writeFileSync('src/pages/AdminFeaturesPage.tsx', code);
