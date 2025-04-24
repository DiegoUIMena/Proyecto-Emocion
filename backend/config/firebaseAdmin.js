// filepath: c:\Users\Diego\Desktop\proyecto_final\backend\config\firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./emocion-c9ae3-firebase-adminsdk-fbsvc-3b0d081405.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


module.exports = admin;