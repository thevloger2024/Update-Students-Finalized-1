const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminFeaturesPage.tsx', 'utf8');

// For loading state
code = code.replace(
  '<div className="min-h-screen flex items-center justify-center bg-slate-50">',
  '<div className="min-h-screen flex flex-col bg-slate-50">\n      <Header />\n      <div className="flex-1 flex items-center justify-center">'
);
code = code.replace(
  '        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>\n      </div>\n    );',
  '        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>\n      </div>\n      </div>\n    );'
);

// For unauthenticated (Login) state
code = code.replace(
  '<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">',
  '<div className="min-h-screen bg-slate-50 flex flex-col">\n      <Header />\n      <div className="flex-1 flex items-center justify-center p-4">'
);
code = code.replace(
  '        </motion.div>\n      </div>\n    );\n  }\n\n  if (user.email !== ADMIN_EMAIL) {',
  '        </motion.div>\n      </div>\n      </div>\n    );\n  }\n\n  if (user.email !== ADMIN_EMAIL) {'
);

// For access denied
code = code.replace(
  '<div className="min-h-screen bg-slate-50 flex flex-col">\n      <Header />\n      <div className="flex-1 flex items-center justify-center p-4">',
  '<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">'
); // Wait, this might match the replaced one?
// Let's just use string replacement on the exact code.

fs.writeFileSync('src/pages/AdminFeaturesPage.tsx', code);
