const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('SettingsProvider')) {
  code = code.replace(
    "import { ThemeProvider } from './contexts/ThemeContext';",
    "import { ThemeProvider } from './contexts/ThemeContext';\nimport { SettingsProvider } from './contexts/SettingsContext';"
  );

  code = code.replace(
    "<LanguageProvider>",
    "<SettingsProvider>\n        <LanguageProvider>"
  );

  code = code.replace(
    "</LanguageProvider>",
    "</LanguageProvider>\n        </SettingsProvider>"
  );

  fs.writeFileSync('src/App.tsx', code);
}
