const fs = require('fs');

let code = fs.readFileSync('src/components/SEO.tsx', 'utf8');

code = code.replace(
  "import { useSettings } from '../contexts/SettingsContext';",
  "import { useSiteSettings } from '../hooks/useSiteSettings';"
);

code = code.replace(
  "const { siteName } = useSettings();",
  "const { settings } = useSiteSettings();\n  const siteName = settings.siteName;"
);

fs.writeFileSync('src/components/SEO.tsx', code);
