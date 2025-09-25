// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBDFygmSGuKr7T4Eg4zVzmMzLbXq9bMsek",
  authDomain: "community-8d9a2.firebaseapp.com",
  projectId: "community-8d9a2",
  storageBucket: "community-8d9a2.firebasestorage.app",
  messagingSenderId: "355282374642",
  appId: "1:355282374642:web:4997f3273d1054c336256b",
  measurementId: "G-VF5WXEFQJX",
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// ✅ Background notifications
messaging.onBackgroundMessage(async (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  // Get all controlled windows/tabs
  const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });

  if (allClients.length > 0) {
    // Send payload to each open client
    allClients.forEach(client => {
      client.postMessage({
        type: "PUSH_MESSAGE",
        payload
      });
    });
  } else {
    // No open client -> show system notification
    /*self.registration.showNotification(payload.notification?.title || "Notification", {
      body: payload.notification?.body || "",
      icon: "/icon-192.png",
      data: {
        url: payload.fcmOptions?.link || "/",  // example: open a URL from FCM
        customData: payload || {},        // all custom fields from your FCM payload
      },
    });*/
  }
});



// ✅ Optional: Handle notification clicks
self?.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.customData.data?.path || "/";
  const payload = event.notification.data?.customData
  console.log("Notification clicked with path:", targetUrl);

  event.waitUntil(clients.openWindow(targetUrl));
});
