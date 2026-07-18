const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  "onClick={() => {\n                                      window.scrollTo({ top: 0, behavior: 'smooth' });\n                                      setSelectedCategory(null);\n                                    }}",
  "onClick={() => navigate('/category/updates')}"
);

fs.writeFileSync('src/pages/Home.tsx', code);
