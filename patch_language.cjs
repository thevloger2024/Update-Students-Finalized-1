const fs = require('fs');
let code = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

code = code.replace(
  /latestUpdates: "Latest Updates",/g,
  'latestUpdates: "Latest Updates",\n    updates: "Updates",'
);
code = code.replace(
  /latestUpdates: "नवीनतम अपडेट",/g,
  'latestUpdates: "नवीनतम अपडेट",\n    updates: "अपडेट्स",'
);

fs.writeFileSync('src/contexts/LanguageContext.tsx', code);
