const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");
const { getFirestore } = require("firebase-admin/firestore");
const { firebaseConfig } = require("./config");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

const db = getFirestore();

module.exports = { admin, db };
