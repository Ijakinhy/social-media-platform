const { db, admin } = require("../utils/admin");
const busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { firebaseConfig } = require("../utils/config");

//  fetch  all  screams
exports.getAllScreams = async (req, res) => {
  try {
    const screamsSnap = await db.collection("screams").get();
    let screams = [];
    screamsSnap.forEach((doc) => {
      screams.push({
        screamId: doc.id,
        ...doc.data(),
      });
    });

    const sortedScreams = screams.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json(sortedScreams);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching screams.");
  }
};

/////  post one scream

exports.postOneScream = async (req, res) => {
  const newScream = {
    createdAt: new Date().toISOString(),
    userHandle: req.authUser.userId,
    profileImage: req.user.profileImage,
    postedBy: req.authUser.handle,
    likeCount: 0,
    commentCount: 0,
  };
  let imageUrl;
  let imageFilename;
  let imageToBeUploaded = {};
  let hasDescription = false;
  let hasImage = false;

  const bb = busboy({ headers: req.headers });

  // text
  bb.on("field", (name, value, info) => {
    if (name === "description") {
      newScream.description = value;
      hasDescription = true;
    }
  });
  //  file
  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;

    if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
      return res.status(400).json({ message: "Wrong file type submitted" });
    }
    const imageExtension = filename.split(".").pop();
    imageFilename = `${Math.floor(Math.random() * 10000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFilename);
    imageToBeUploaded = { filepath, mimeType };
    file.pipe(fs.createWriteStream(filepath));
    hasImage = true;
  });
 console.log({storege:process.env.FIREBASE_STORAGE_BUCKET}) 
  bb.on("finish", async () => {
    try {
      if (hasImage) {
        await admin
          .storage()
          .bucket()
          .upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
              metadata: {
                "Content-Type": imageToBeUploaded.mimeType,
              },
            },
          });

        imageUrl = `http://127.0.0.1:9199/v0/b/${firebaseConfig.storageBucket}/o/${imageFilename}?alt=media`;
        newScream.screamImage = imageUrl;
      }
      if (!hasDescription && !hasImage) {
        return res.status(400).json({
          message: "At least one of 'description' or 'image' must be provided",
        });
      }

      const docRef = await db.collection("screams").add(newScream);
      res.status(201).json({ ...newScream, screamId: docRef.id });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error while uploading file.");
    }
  });

  bb.on("error", () => {
    console.error("busboy error");
    res.status(500).send("error while creating a scream!");
  });
  bb.end(req.rawBody);
};

// comment on scream
exports.addCommentScream = async (req, res) => {
  if (!req.body.commentText || req.body.commentText.trim() === "") {
    return res.status(400).json({ error: "must not be empty." });
  }
  const newComment = {
    userHandle: req.authUser.userId,
    postedBy: req.authUser.handle,
    commentText: req.body.commentText,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    profileImage: req.user.profileImage,
  };
  try {
    const screamDoc = db.doc(`/screams/${newComment.screamId}`);
    const screamSnap = await screamDoc.get();
    if (!screamSnap.exists) {
      return res.status(404).json({ error: "Scream not found." });
    }
    let updatedScreamComments;
    const notificationsRef = db.collection("notifications").doc();
    await db.runTransaction(async (transaction) => {
      /// add comment and update scream commentCount
      transaction.set(db.collection("comments").doc(), newComment);
      updatedScreamComments = screamSnap.data().commentCount + 1;
      transaction.update(screamDoc, { commentCount: updatedScreamComments });
    });
    return res
      .status(201)
      .json({ ...newComment, commentCount: updatedScreamComments });
  } catch (error) {
    console.error(error);
    res.status(500).json("Error while commenting on a scream.");
  }
};

//      like the scream
exports.likeScream = async (req, res) => {
  try {
    const likesDetails = {
      createdAt: new Date().toISOString(),
      screamId: req.params.screamId,
      profileImage: req.user.profileImage,
      userHandle: req.authUser.userId,
      postedBy: req.authUser.handle,
      
    };
    const screamDoc = db.doc(`/screams/${req.params.screamId}`);
    const screamSnap = await screamDoc.get();
    const likeSnap = await db
      .collection("likes")
      .where("screamId", "==", req.params.screamId)
      .where("userHandle", "==", req.authUser.userId)
      .get();
    if (!screamSnap.exists) {
      return res.status(404).json({ error: "Scream not found." });
    }
    if (likeSnap.docs.length > 0) {
      return res.status(400).json({ error: "Scream already liked" });
    }

    await db.collection("likes").add(likesDetails);

    return res.status(201).json({
      ...likesDetails,
      likeCount: screamSnap.data().likeCount + 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while liking a scream." });
  }
};

//  unlike the scream
exports.unlikeScream = async (req, res) => {
  try {
    const screamDoc = db.doc(`/screams/${req.params.screamId}`);
    const screamSnap = await screamDoc.get();
    const likeSnap = await db
      .collection("likes")
      .where("screamId", "==", req.params.screamId)
      .where("userHandle", "==", req.authUser.userId)
      .get();
    if (!screamSnap.exists) {
      return res.status(404).json({ error: "Scream not found." });
    }
    if (likeSnap.docs.length === 0 || screamSnap.data().likeCount === 0) {
      return res.status(400).json({ error: "Scream  not liked" });
    }

    await db.doc(`/likes/${likeSnap.docs[0].id}`).delete();

    return res.status(201).json({
      ...screamSnap.data(),
      likeCount: !screamSnap.data().likeCount
        ? 0
        : screamSnap.data().likeCount - 1,
      screamId: req.params.screamId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while unlike the scream." });
  }
};

//  delete scream

exports.deleteScream = async (req, res) => {
  try {
    const screamDoc = db.doc(`/screams/${req.params.screamId}`);
    const screamSnap = await screamDoc.get();
    const butch = db.batch();
    if (!screamSnap.exists) {
      return res.status(404).json({ error: "Scream not found." });
    }

    if (req.user.handle === screamSnap.data().userHandle) {
      butch.delete(screamDoc);
      // delete relate likes
      const likesSnap = await db
        .collection("likes")
        .where("screamId", "==", req.params.screamId)
        .get();
      likesSnap.forEach((likeDoc) => {
        butch.delete(likeDoc.ref);
      });
      // delete relate comments
      const commentsSnap = await db
        .collection("comments")
        .where("screamId", "==", req.params.screamId)
        .get();
      commentsSnap.forEach((commentDoc) => {
        butch.delete(commentDoc.ref);
      });
      ///  delete the notification
      const notificationsSnap = await db
        .collection("notifications")
        .where("screamId", "==", req.params.screamId)
        .get();
      notificationsSnap.forEach((notification) => {
        butch.delete(notification.ref);
      });

      await butch.commit();
      return res.status(200).json({ message: "Scream deleted successfully." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while deleting scream." });
  }
};

///  fetch one scream

exports.getOneScreamDetail = async (req, res) => {
  try {
    let screamDetails = {};
    const screamDoc = (
      await db.doc(`/screams/${req.params.screamId}`).get()
    ).data();
    screamDetails.scream = {
      ...screamDoc,
      screamId: req.params.screamId,
    };
    const commentsSnap = await db
      .collection("comments")
      .where("screamId", "==", req.params.screamId)
      .orderBy("createdAt", "asc")
      .get();
    screamDetails.comments = [];
    if (!commentsSnap.empty) {
      commentsSnap.forEach((doc) => {
        screamDetails.comments.push({
          ...doc.data(),
          commentId: doc.id,
        });
      });
    }
    return res.status(200).json(screamDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error while fetching scream." });
  }
};
