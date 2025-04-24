//importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js');
//importScripts('https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging.js');

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


const firebaseConfig = {
  apiKey: "AIzaSyAuDat2HDDr4B3OrbufPfRGbdH_eNhLtfM",
  authDomain: "emocion-c9ae3.firebaseapp.com",
  projectId: "emocion-c9ae3",
  storageBucket: "emocion-c9ae3.firebasestorage.app",
  messagingSenderId: "2074762899",
  appId: "1:2074762899:web:45d7bde9b032b794a13766",
  measurementId: "G-KNYDJNGGQQ"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Recibiste un mensaje en segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
