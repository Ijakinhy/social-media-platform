const axios = require("axios");
const { db, admin } = require("../utils/admin");
const { firebaseConfig } = require("../utils/config");
const busboy = require("busboy");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { transcode } = require("buffer");
const { FieldValue } = require("firebase-admin/firestore");

exports.signUpUser = async (req, res) => {
  try {
    const newUser = {
      handle: req.body.handle,
      email: req.body.email,
      profileImage:
        "http://127.0.0.1:9199/v0/b/social-platform-ijakinhy.firebasestorage.app/o/default.jpg?alt=media",
      password: req.body.password,
    };
    let errors = {};
    if (!newUser.handle) {
      errors.handle = "Must not be empty";
    }

    if (!newUser.password) {
      errors.password = "Must not be empty";
    } else if (newUser.password.length < 6) {
      errors.password = "Must be at least 6 characters long";
    }

    if (!newUser.email) {
      errors.email = "Must not be empty";
    } else if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(newUser.email)) {
      errors.email = "Must be a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const signUpUrl = `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
    const userDoc = await db.doc(`/users/${newUser.handle}`).get();
    if (userDoc.exists) {
      return res.status(400).json({ error: "User already exists." });
    } else {
      const response = await axios.post(signUpUrl, {
        email: newUser.email,
        password: newUser.password,
        returnSecureToken: true,
      });

      db.doc(`/users/${newUser.handle}`).set({
        email: newUser.email,
        handle: newUser.handle,
        userId: response.data.localId,
        profileImage: newUser.profileImage,
      });
      return res.status(201).json({
        newUser,
        token: response.data.idToken,
        userId: response.data.localId,
        refreshToken: response.data.refreshToken,
      });
    }
  } catch (error) {
    if (
      error.response &&
      error.response.data.error.message === "EMAIL_EXISTS"
    ) {
      return res.status(400).json({ email: "This email is already in use" });
    }

    return res
      .status(500)
      .json({ general: "Something went wrong,please try again!" });
  }
};

exports.signInUser = async (req, res) => {
  try {
    const loginUrl = `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
    const response = await axios.post(loginUrl, {
      email: req.body.email,
      password: req.body.password,
      returnSecureToken: true,
    });

    return res.status(201).json({
      token: response.data.idToken,
      userId: response.data.localId,
      refreshToken: response.data.refreshToken,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getUserData = async (req, res) => {
  const handle = req.params.handle;
  try {
    let userData = {};
    const userSnap = await db.doc(`/users/${handle}`).get();
    if (userSnap.exists) {
      userData.user = userSnap.data();
    }
    console.log({ handle });

    const screamsSnap = await db
      .collection("screams")
      .where("userHandle", "==", handle)
      .orderBy("createdAt", "desc")
      .get();
    userData.screams = [];
    screamsSnap.forEach((doc) => {
      userData.screams.push({
        screamId: doc.id,
        ...doc.data(),
      });
    });
    return res.status(201).json({ userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ general: "error happen while fetching data" });
  }
};
////  add user details
exports.addUserDetails = async (req, res) => {
  const userDetails = {};
  try {
    let errors = {};
    if (req.body.bio) {
      userDetails.bio = req.body.bio;
    }
    if (req.body.location) {
      userDetails.location = req.body.location;
    }
    if (req.body.website) {
      if (req.body.website.substr(0, 4) !== "http") {
        errors.website = "must be valid url";
        return res.status(400).json(errors);
      } else {
        userDetails.website = req.body.website;
      }
    }
    if (req.body.instagram) {
      userDetails.instagram = req.body.instagram;
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const userRef = db.doc(`/users/${req.user.handle}`);

    userRef.update(userDetails);

    return res.status(201).json(userDetails);
  } catch (error) {
    res.status(500).json({ general: "error happen while adding details" });
  }
};
//// fetch the authenticated user
exports.getAuthenticatedUser = async (req, res) => {
  try {
    let authUserDetails = {};

    const userSnap = await db.doc(`/users/${req.user.handle}`).get();
    const screamsSnap = await db
      .collection("screams")
      .orderBy("createdAt", "desc")
      .get();
    const notificationsSnap = await db
      .collection("notifications")
      .where("recipient", "==", req.user.handle)
      .get();

    if (userSnap.exists) {
      authUserDetails.credentials = userSnap.data();
    }

    authUserDetails.notifications = [];
    if (!notificationsSnap.empty) {
      notificationsSnap.forEach((doc) => {
        authUserDetails.notifications.push({
          notificationId: doc.id,
          ...doc.data(),
        });
      });
    }
    authUserDetails.screams = [];
    if (!screamsSnap.empty) {
      screamsSnap.forEach((doc) => {
        authUserDetails.screams.push({
          screamId: doc.id,
          ...doc.data(),
        });
      });
    }

    return res.status(200).json(authUserDetails);
  } catch (error) {
    return res.status(403).json({ error: "error while fetching user data " });
  }
};
/// uploading profile image
exports.uploadProfilePic = async (req, res) => {
  const bb = busboy({ headers: req.headers });
  const userDoc = db.doc(`/users/${req.user.handle}`);

  const screamsSnap = await db
    .collection("screams")
    .where("userHandle", "==", req.user.handle)
    .get();
  const commentsSnap = await db
    .collection("comments")
    .where("userHandle", "==", req.user.handle)
    .get();
  const likesSnap = await db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .get();
  const notificationsSnap = await db
    .collection("notifications")
    .where("userHandle", "==", req.user.handle)
    .get();

  let imageToBeUploaded;
  let imageFilename;
  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
      file.resume();
      bb.removeAllListeners();
      return res.status(400).json({ error: "wrong image type" });
    }
    const imageExtension = filename.split(".").pop();
    imageFilename = `${Math.floor(Math.random() * 1000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFilename);
    imageToBeUploaded = { filepath, mimeType };
    file.pipe(fs.createWriteStream(filepath));
  });
  bb.on("finish", async () => {
    try {
      await admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: true,
          metadata: {
            metadata: {
              "Content-Type": imageToBeUploaded.mimeType,
            },
          },
        });

      const imageUrl = `http://127.0.0.1:9199/v0/b/${firebaseConfig.storageBucket}/o/${imageFilename}?alt=media`;

      if (req.user.profileImage !== imageUrl) {
        await db.runTransaction(async (transaction) => {
          transaction.update(userDoc, { profileImage: imageUrl });

          screamsSnap.forEach((doc) => {
            transaction.update(doc.ref, { profileImage: imageUrl });
          });
          commentsSnap.forEach((doc) => {
            transaction.update(doc.ref, { profileImage: imageUrl });
          });
          likesSnap.forEach((doc) => {
            transaction.update(doc.ref, { profileImage: imageUrl });
          });
          notificationsSnap.forEach((doc) => {
            transaction.update(doc.ref, { profileImage: imageUrl });
          });
        });
      }
      return res.status(200).json({ imageUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "error while uploading file" });
    }
  });

  bb.end(req.rawBody);
};

///  mark  notification read

exports.markNotificationRead = async (req, res) => {
  try {
    const butch = db.batch();

    const notificationsSnap = await db
      .collection("notifications")
      .where("type", "in", ["like", "comment"])
      .where("recipient", "==", req.user.handle)
      .get();

    if (notificationsSnap.empty)
      return res.status(200).json({ message: "no unread notifications" });

    notificationsSnap.forEach((doc) => {
      butch.update(db.doc(`/notifications/${doc.id}`), {
        read: true,
      });
    });

    await butch.commit();
    return res.status(200).json({ message: "notification marked read" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "error while marking notification read" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const usersSnap = db.doc(`/users/${req.user.handle}`);
    await usersSnap.update({
      blocked: FieldValue.arrayUnion(req.params.userId),
    });
    return res.json({ message: "user blocked" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "error while blocking user" });
  }
};

exports.getUserMessages = async (req, res) => {
  try {
    let chats = [];

    const recipientMessagesSnap = await db
      .collection("chats")
      .doc(req.params.sender)
      .collection("messages")
      .where("recipient", "==", req.user.handle)
      .orderBy("updatedAt", "asc")
      .get();
    const senderMessagesSnap = await db
      .collection("chats")
      .doc(req.user.handle)
      .collection("messages")
      .where("recipient", "==", req.params.sender)
      .orderBy("updatedAt", "asc")
      .get();
    console.log(req.params.sender);
    console.log(req.user.handle);

    recipientMessagesSnap.forEach((doc) => {
      chats.push(doc.data());
    });
    senderMessagesSnap.forEach((doc) => {
      chats.push(doc.data());
    });
    return res.json(chats);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "error while getting messages" });
  }
};
