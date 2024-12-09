const { db, admin } = require("./utils/admin");
const functions = require("firebase-functions");
const express = require("express");
const {
  getAllScreams,
  postOneScream,
  addCommentScream,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/screams");
const { signUpUser, signInUser, getUserData } = require("./handlers/users");
const authMiddleware = require("./utils/authMiddleware");
const app = express();

app.get("/screams", getAllScreams); /// get all  screams
app.post("/scream", authMiddleware, postOneScream); //  add one scream
app.post("/signUp", signUpUser); ///  sign up
app.post("/signIn", signInUser); ///  sign in
app.get("/user/:handle", authMiddleware, getUserData); //  fetch user details
app.post("/scream/:screamId/comment", authMiddleware, addCommentScream); ///  comment on scream
app.get("/scream/:screamId/like", authMiddleware, likeScream); /// like   a  scream
app.get("/scream/:screamId/unlike", authMiddleware, unlikeScream); /// unlike   a  scream
app.delete("/scream/:screamId", authMiddleware, deleteScream); // delete scream

exports.api = functions.https.onRequest(app);
