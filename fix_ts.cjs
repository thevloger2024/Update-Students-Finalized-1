const fs = require('fs');

// Fix JobGuideSection
let jobGuideCode = fs.readFileSync('src/components/JobGuideSection.tsx', 'utf8');
jobGuideCode = jobGuideCode.replace(
  "const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));",
  "const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));"
);
fs.writeFileSync('src/components/JobGuideSection.tsx', jobGuideCode);

// Fix AdminFeaturesPage
let adminCode = fs.readFileSync('src/pages/AdminFeaturesPage.tsx', 'utf8');
if (adminCode.includes("icon: Briefcase,")) {
  if (!adminCode.includes("Briefcase, ")) {
    adminCode = adminCode.replace(
      "import { ArrowLeft, BookOpen,",
      "import { ArrowLeft, BookOpen, Briefcase,"
    );
  }
}
fs.writeFileSync('src/pages/AdminFeaturesPage.tsx', adminCode);

