const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

code = code.replace(
  '<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">',
  '<div className="min-h-screen bg-slate-50 flex flex-col">\n      <Header />\n      <div className="flex-1 flex items-center justify-center p-4">'
);

code = code.replace(
  '          </div>\n        </motion.div>\n      </div>\n    );\n  }',
  '          </div>\n        </motion.div>\n      </div>\n      </div>\n    );\n  }'
);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
