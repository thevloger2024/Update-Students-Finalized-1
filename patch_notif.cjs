const fs = require('fs');

let code = fs.readFileSync('src/pages/NotificationSettingsPage.tsx', 'utf8');

if (!code.includes('requestPushNotificationPermission')) {
  code = code.replace(
    "import { db, auth } from '../firebase';",
    "import { db, auth, requestPushNotificationPermission } from '../firebase';"
  );

  code = code.replace(
    "const handleToggle = (key: keyof NotificationSettings) => {",
    "const handleToggle = async (key: keyof NotificationSettings) => {\n    if (key === 'globalEnabled' && !settings.globalEnabled) {\n      try {\n        const token = await requestPushNotificationPermission();\n        if (token) {\n          toast.success(t('pushEnabledSuccess') || 'Push notifications enabled!');\n          if (userId) {\n            // Save token to user profile\n            await setDoc(doc(db, `users/\${userId}`), { fcmToken: token }, { merge: true });\n          }\n        } else {\n          toast.error(t('pushPermissionDenied') || 'Push notification permission denied.');\n          return;\n        }\n      } catch (error) {\n        console.error(error);\n        toast.error('Failed to enable push notifications');\n        return;\n      }\n    }"
  );

  fs.writeFileSync('src/pages/NotificationSettingsPage.tsx', code);
}
