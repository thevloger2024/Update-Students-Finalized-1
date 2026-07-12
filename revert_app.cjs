const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { SettingsProvider } from './contexts/SettingsContext';",
  ""
);

code = code.replace(
  "<SettingsProvider>\n        <LanguageProvider>",
  "<LanguageProvider>"
);

code = code.replace(
  "</LanguageProvider>\n        </SettingsProvider>",
  "</LanguageProvider>"
);

fs.writeFileSync('src/App.tsx', code);
