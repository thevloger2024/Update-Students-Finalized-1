const fs = require('fs');
let code = fs.readFileSync('src/pages/NotificationSettingsPage.tsx', 'utf8');

code = code.replace(
  "import { auth, db } from '../firebase';",
  "import { auth, db, requestPushNotificationPermission } from '../firebase';"
);

fs.writeFileSync('src/pages/NotificationSettingsPage.tsx', code);
