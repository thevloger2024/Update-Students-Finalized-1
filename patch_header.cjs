const fs = require('fs');

let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

if (!code.includes('useSettings')) {
  code = code.replace(
    "import { useTheme } from '../contexts/ThemeContext';",
    "import { useTheme } from '../contexts/ThemeContext';\nimport { useSettings } from '../contexts/SettingsContext';"
  );

  code = code.replace(
    "const { theme, toggleTheme } = useTheme();",
    "const { theme, toggleTheme } = useTheme();\n  const { siteName } = useSettings();"
  );

  code = code.replace(
    /<span className="font-serif text-2xl md:text-3xl font-bold tracking-tight">\s*Update Students\s*<\/span>/,
    `<span className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
              {siteName}
            </span>`
  );

  fs.writeFileSync('src/components/Header.tsx', code);
}
