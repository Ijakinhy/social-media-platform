const { db, admin } = require("./utils/admin");
const functions = require("firebase-functions");
const express = require("express");
const { getAllScreams, postOneScream } = require("./handlers/screams");
const { signUpUser, signInUser } = require("./handlers/users");
const authMiddleware = require("./utils/authMiddleware");
const app = express();

app.get("/screams", getAllScreams);
app.post("/scream", authMiddleware, postOneScream);
app.post("/signUp", signUpUser);
app.post("/signIn", signInUser);

exports.api = functions.https.onRequest(app);
