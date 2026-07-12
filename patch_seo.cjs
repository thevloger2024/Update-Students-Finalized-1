const fs = require('fs');

let code = fs.readFileSync('src/components/SEO.tsx', 'utf8');

if (!code.includes('useSettings')) {
  code = code.replace(
    "import { Helmet } from 'react-helmet-async';",
    "import { Helmet } from 'react-helmet-async';\nimport { useSettings } from '../contexts/SettingsContext';"
  );

  code = code.replace(
    "export function SEO({ title, description, keywords, url, jobPosting }: SEOProps) {",
    "export function SEO({ title, description, keywords, url, jobPosting }: SEOProps) {\n  const { siteName } = useSettings();"
  );

  code = code.replace(
    "<title>{title} | Update Students</title>",
    "<title>{title} | {siteName}</title>"
  );

  fs.writeFileSync('src/components/SEO.tsx', code);
}
