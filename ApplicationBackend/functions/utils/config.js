const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const getStorageUrl = (filename) => {
  const bucket = firebaseConfig.storageBucket;
  const encodedFilename = encodeURIComponent(filename);

  if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    return `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket}/o/${encodedFilename}?alt=media`;
  }

  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFilename}?alt=media`;
};

module.exports = { firebaseConfig, getStorageUrl };
