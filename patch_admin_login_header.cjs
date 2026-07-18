const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// For loading state
code = code.replace(
  '<div className="min-h-screen flex items-center justify-center bg-slate-50">',
  '<div className="min-h-screen flex flex-col bg-slate-50">\n      <Header />\n      <div className="flex-1 flex items-center justify-center">'
);
code = code.replace(
  '        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>\n      </div>',
  '        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>\n      </div>\n    </div>'
);

// For unauthenticated (Login) state
code = code.replace(
  '<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">',
  '<div className="min-h-screen bg-slate-50 flex flex-col">\n      <Header />\n      <div className="flex-1 flex items-center justify-center p-4">'
);
// The closing tag for this div is currently `</div>\n    );` we need to replace it with `</div>\n      </div>\n    );`
// Wait, we can't reliably replace the exact closing div. We need to be careful.

fs.writeFileSync('src/pages/AdminPage.tsx', code);
