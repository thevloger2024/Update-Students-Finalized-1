importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCMCbPiqYI0kK6aixbCmDgfYBCE4mybCQI",
  authDomain: "gen-lang-client-0720728369.firebaseapp.com",
  projectId: "gen-lang-client-0720728369",
  storageBucket: "gen-lang-client-0720728369.firebasestorage.app",
  messagingSenderId: "1025882564802",
  appId: "1:1025882564802:web:25e9a7c3c5244ecb52b35b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
