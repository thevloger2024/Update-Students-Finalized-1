const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

code = code.replace(
  '        </motion.div>\n      </div>\n    );\n  }\n\n  if (user.email !== ADMIN_EMAIL) {',
  '        </motion.div>\n      </div>\n      </div>\n    );\n  }\n\n  if (user.email !== ADMIN_EMAIL) {'
);

fs.writeFileSync('src/pages/AdminPage.tsx', code);
