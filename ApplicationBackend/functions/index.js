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
const {
  signUpUser,
  signInUser,
  getUserData,
  addUserDetails,
  getAuthenticatedUser,
  uploadProfilePic,
  markNotificationRead,
  blockUser,
  getAllUserChats,
} = require("./handlers/users");
const authMiddleware = require("./utils/authMiddleware");
const {
  createChat,
  sendMessage,
  markMessageSeen,
  markMessageNotificationRead,
} = require("./handlers/chats");
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
app.post("/user", authMiddleware, addUserDetails);
app.get("/user", authMiddleware, getAuthenticatedUser);
app.post("/user/image", authMiddleware, uploadProfilePic);
app.get("/markNotificationRead", authMiddleware, markNotificationRead);
app.get("/selectChat", authMiddleware, createChat);
app.post("/sendMessage/:recipient", authMiddleware, sendMessage);
app.get("/markMessageSeen", authMiddleware, markMessageSeen);
app.get(
  "/markMessageNotificationRead",
  authMiddleware,
  markMessageNotificationRead
);
app.get("/blockUser/:userId", authMiddleware, blockUser);
app.get("/getAllUserChats/:handle", authMiddleware, getAllUserChats);

exports.api = functions.https.onRequest(app);
