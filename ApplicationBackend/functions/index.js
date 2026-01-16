const { db } = require("./utils/admin");
const functions = require("firebase-functions");
const express = require("express");
const {
  getAllScreams,
  postOneScream,
  addCommentScream,
  likeScream,
  unlikeScream,
  deleteScream,
  getOneScreamDetail,
} = require("./handlers/screams");
const {
  signUpUser,
  signInUser,
  getUserData,
  addUserDetails,
  uploadProfilePic,
  markNotificationRead,
  blockUser,
  getAuthenticatedUsed,
} = require("./handlers/users");
const authMiddleware = require("./utils/authMiddleware");
const {
  createChat,
  sendMessage,
  getMessages,
  markMessageSeen,
  markMessageNotificationRead,
} = require("./handlers/chats");
const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const app = express();

// 

app.get("/screams", getAllScreams);
app.get("/scream/:screamId", authMiddleware, getOneScreamDetail);
app.post("/scream", authMiddleware, postOneScream);
app.post("/signUp", signUpUser);
app.post("/signIn", signInUser);
app.get("/user/:handle", authMiddleware, getUserData);
app.post("/scream/:screamId/comment", authMiddleware, addCommentScream);
app.get("/scream/:screamId/like", authMiddleware, likeScream);
app.get("/scream/:screamId/unlike", authMiddleware, unlikeScream);
app.delete("/scream/:screamId", authMiddleware, deleteScream);
app.post("/user", authMiddleware, addUserDetails);

app.get("/user", authMiddleware, getAuthenticatedUsed);
app.post("/user/image", authMiddleware, uploadProfilePic);

app.get("/markNotificationRead", authMiddleware, markNotificationRead);

// Chat routes
app.post("/chat", authMiddleware, createChat);
app.post("/chat/:chatId/message", authMiddleware, sendMessage);
app.get("/chat/:chatId/messages", authMiddleware, getMessages);
app.post("/chat/:chatId/markSeen", authMiddleware, markMessageSeen);
app.get("/markMessageNotificationRead", authMiddleware, markMessageNotificationRead);

app.get("/blockUser/:userId", authMiddleware, blockUser);

exports.api = onRequest(app);

// event trigger

exports.createSmsNotifications = onDocumentCreated(
  "/chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      const messageData = event.data.data();
      const recipientId = messageData.recipientId;
      const senderId = messageData.senderId;

      // Don't create notification if sender is recipient
      if (recipientId === senderId) return;

      // Get sender info for notification
      const senderDoc = await db.doc(`/users/${senderId}`).get();
      const senderData = senderDoc.data();

      await db.collection("notifications").add({
        recipient: recipientId,
        sender: senderId,
        senderHandle: senderData && senderData.handle,
        senderAvatar: senderData && senderData.profileImage,
        type: "message",
        createdAt: new Date().toISOString(),
        read: false,
        chatId: event.params.chatId,
        messageId: event.params.messageId,
        messagePreview: messageData.text ? messageData.text.substring(0, 50) : "",
      });
    } catch (error) {
      console.error(error);
    }
  },
);

//  create notification on like and increase scream likeCount

exports.createLikeNotifications = onDocumentCreated(
  "/likes/{id}",
  async (event) => {
    const likes = event.data.data();
    const screamSnap = (
      await db.doc(`/screams/${likes.screamId}`).get()
    ).data();

    // //  create notification
    if (likes.userHandle !== screamSnap.userHandle) {
      await db.collection("notifications").add({
        recipient: screamSnap.postedBy,
        sender: likes.postedBy,
        type: "like",
        createdAt: new Date().toISOString(),
        read: false,
        screamId: likes.screamId,
        profileImage: likes.profileImage,
      });
    }

    // / increase scream likeCount
    const screamDoc = db.doc(`/screams/${likes.screamId}`);
    const scream = await screamDoc.get();
    if (scream.exists) {
      await screamDoc.update({ likeCount: scream.data().likeCount + 1 });
    }
  },
);

// //  delete notification on unlike and  decrease the scream likeCount

exports.deleteLikeNotification = onDocumentDeleted(
  "/likes/{id}",
  async (event) => {
    const data = event.data.data();

    //
    const notificationSnap = await db
      .collection("notifications")
      .where("sender", "==", data.postedBy)
      .where("screamId", "==", data.screamId)
      .where("type", "==", "like")
      .get();
    notificationSnap.forEach(async (doc) => {
      await doc.ref.delete();
    });

    // / decrease the scream likeCount

    const screamDoc = db.doc(`/screams/${data.screamId}`);
    const scream = await screamDoc.get();

    if (scream.exists) {
      await screamDoc.update({ likeCount: scream.data().likeCount - 1 });
    }
  },
);

//  create  notification doc on comment

exports.createCommentNotifications = onDocumentCreated(
  "/comments/{id}",
  async (event) => {
    const comments = event.data.data();
    const screamSnap = (
      await db.doc(`/screams/${comments.screamId}`).get()
    ).data();
    if (event.data.data().userHandle !== screamSnap.userHandle) {
      await db.collection("notifications").add({
        recipient: screamSnap.postedBy,
        sender: comments.postedBy,
        type: "comment",
        createdAt: new Date().toISOString(),
        read: false,
        screamId: comments.screamId,
        profileImage: comments.profileImage,
      });
    }
  },
);

// /  update profile url when image changes

exports.changeProfileImageUrl = onDocumentUpdated(
  "/users/{handle}",
  async (event) => {
    if (
      event.data.before.data().profileImage !==
      event.data.after.data().profileImage
    ) {
      console.log("profile changed ");

      const batch = db.batch();
      // const userRef  =  db.doc(`/users/${event.params.handle}`)
      const screamsSnap = await db
        .collection("screams")
        .where("userHandle", "==", event.params.handle)
        .get();
      const commentsSnap = await db
        .collection("comments")
        .where("userHandle", "==", event.params.handle)
        .get();
      const likesSnap = await db
        .collection("likes")
        .where("userHandle", "==", event.params.handle)
        .get();
      const notificationsSnap = await db
        .collection("notifications")
        .where("type", "in", ["like", "comment"])
        .where("sender", "==", event.params.handle)
        .get();

      screamsSnap.forEach((doc) => {
        batch.update(doc.ref, {
          profileImage: event.data.after.data().profileImage,
        });
      });
      commentsSnap.forEach((doc) => {
        batch.update(doc.ref, {
          profileImage: event.data.after.data().profileImage,
        });
      });
      likesSnap.forEach((doc) => {
        batch.update(doc.ref, {
          profileImage: event.data.after.data().profileImage,
        });
      });

      notificationsSnap.forEach((doc) => {
        console.log(doc.id);
        batch.update(db.doc(`/notifications/${doc.id}`), {
          profileImage: event.data.after.data().profileImage,
        });
      });

      await batch.commit();
    }
  },
);
