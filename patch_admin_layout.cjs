const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

// Ensure tabs are wrapped on small laptops
code = code.replace(
  'className="flex flex-wrap items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit"',
  'className="flex flex-wrap items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-full md:w-fit"'
);

// Make sure inputs inside the add update form are responsive
code = code.replace(
  'className="grid grid-cols-1 md:grid-cols-2 gap-6"',
  'className="grid grid-cols-1 sm:grid-cols-2 gap-6"'
);
code = code.replace(
  'className="grid grid-cols-1 md:grid-cols-2 gap-6"',
  'className="grid grid-cols-1 sm:grid-cols-2 gap-6"'
);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
