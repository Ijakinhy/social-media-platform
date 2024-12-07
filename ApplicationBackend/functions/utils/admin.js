const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");
const { getFirestore } = require("firebase-admin/firestore");
const { firebaseConfig } = require("./config");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `http://localhost:5001/${firebaseConfig.projectId}/us-central1/`,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

const db = getFirestore();

module.exports = { admin, db };
