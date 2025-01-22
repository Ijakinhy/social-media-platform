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
  getUserMessages,
  getUserDetails,
  getAuthenticatedUsed,
} = require("./handlers/users");
const authMiddleware = require("./utils/authMiddleware");
const {
  createChat,
  sendMessage,
  markMessageSeen,
  markMessageNotificationRead,
} = require("./handlers/chats");
const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require("firebase-functions/v2/firestore");
const { FieldValue } = require("firebase-admin/firestore");
const app = express();

app.get("/screams", getAllScreams); /// get all  screams
app.get("/scream/:screamId", authMiddleware, getOneScreamDetail);
app.post("/scream", authMiddleware, postOneScream); //  add one scream
app.post("/signUp", signUpUser); ///  sign up
app.post("/signIn", signInUser); ///  sign in
app.get("/user/:handle", authMiddleware, getUserData); //  fetch user details
app.post("/scream/:screamId/comment", authMiddleware, addCommentScream); ///  comment on scream
app.get("/scream/:screamId/like", authMiddleware, likeScream); /// like   a  scream
app.get("/scream/:screamId/unlike", authMiddleware, unlikeScream); /// unlike   a  scream
app.delete("/scream/:screamId", authMiddleware, deleteScream); // delete scream
app.post("/user", authMiddleware, addUserDetails); ///  add user details

app.get("/user", authMiddleware, getAuthenticatedUsed); ///  get authenticated user
app.post("/user/image", authMiddleware, uploadProfilePic); ////  edit or or add profile details
app.get("/markNotificationRead", authMiddleware, markNotificationRead); ///  mark notification read
app.get("/selectChat", authMiddleware, createChat); ///  create chats
app.post("/sendMessage/:recipient", authMiddleware, sendMessage); ///  send messages
app.get("/markMessageSeen", authMiddleware, markMessageSeen); // mark message seen
app.get(
  "/markMessageNotificationRead",
  authMiddleware,
  markMessageNotificationRead
); ////  read chats notifications
app.get("/blockUser/:userId", authMiddleware, blockUser); ///  block the user
app.get("/getUserMessages/:sender", authMiddleware, getUserMessages); ///  get  user messages

exports.api = functions.https.onRequest(app);

// event trigger

exports.createSmsNotifications = onDocumentCreated(
  "/chats/{userHandle}/messages/{messageId}",
  async (event) => {
    try {
      const recipient = await event.data._fieldsProto.recipient.stringValue;

      if (recipient !== event.params.userHandle) {
        await db.collection("notifications").add({
          recipient,
          sender: event.params.userHandle,
          type: "message",
          createdAt: new Date().toISOString(),
          read: false,
          messageId: event.params.messageId,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
);

//  create notification on like and increase scream likeCount

exports.createLikeNotifications = onDocumentCreated(
  "/likes/{id}",
  async (event) => {
    const likes = event.data.data();
    const screamSnap = (
      await db.doc(`/screams/${likes.screamId}`).get()
    ).data();

    ////  create notification
    if (likes.userHandle !== screamSnap.userHandle) {
      await db.collection("notifications").add({
        recipient: screamSnap.userHandle,
        sender: likes.userHandle,
        type: "like",
        createdAt: new Date().toISOString(),
        read: false,
        screamId: likes.screamId,
        profileImage: likes.profileImage,
      });
    }

    /// increase scream likeCount
    const screamDoc = db.doc(`/screams/${likes.screamId}`);
    const scream = await screamDoc.get();
    if (scream.exists) {
      await screamDoc.update({ likeCount: scream.data().likeCount + 1 });
    }
  }
);

////  delete notification on unlike and  decrease the scream likeCount

exports.deleteLikeNotification = onDocumentDeleted(
  "/likes/{id}",
  async (event) => {
    const data = event.data.data();

    //
    const notificationSnap = await db
      .collection("notifications")
      .where("sender", "==", data.userHandle)
      .where("screamId", "==", data.screamId)
      .where("type", "==", "like")
      .get();
    notificationSnap.forEach(async (doc) => {
      await doc.ref.delete();
    });

    /// decrease the scream likeCount

    const screamDoc = db.doc(`/screams/${data.screamId}`);
    const scream = await screamDoc.get();

    if (scream.exists) {
      await screamDoc.update({ likeCount: scream.data().likeCount - 1 });
    }
  }
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
        recipient: screamSnap.userHandle,
        sender: comments.userHandle,
        type: "comment",
        createdAt: new Date().toISOString(),
        read: false,
        screamId: comments.screamId,
        profileImage: comments.profileImage,
      });
    }
  }
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
  }
);
