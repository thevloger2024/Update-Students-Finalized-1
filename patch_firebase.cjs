const fs = require('fs');

let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('getMessaging')) {
  code = code.replace(
    "import { initializeApp } from 'firebase/app';",
    "import { initializeApp } from 'firebase/app';\nimport { getMessaging, getToken, onMessage } from 'firebase/messaging';"
  );

  code += `
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestPushNotificationPermission = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        // You should add your VAPID key here if you have one
        // vapidKey: 'YOUR_VAPID_KEY'
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};
`;

  fs.writeFileSync('src/firebase.ts', code);
}
