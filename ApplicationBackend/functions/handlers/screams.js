const { db, admin } = require("../utils/admin");
const { uploadImage } = require("../utils/upload");
const busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { firebaseConfig } = require("../utils/config");

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

exports.postOneScream = async (req, res) => {
  const newScream = {
    createdAt: new Date().toISOString(),
    userHandle: req.user.handle,
    profileImage:
      "http://127.0.0.1:9199/v0/b/social-platform-ijakinhy.firebasestorage.app/o/default.jpg?alt=media",
    likeCount: 0,
    commentCount: 0,
  };
  let imageUrl;

  const bb = busboy({ headers: req.headers });

  // text
  bb.on("field", (name, value, info) => {
    if (name === "description") {
      newScream.description = value;
    }
  });
  //  file
  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;

    if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
      return res.status(400).json({ message: "Wrong file type submitted" });
    }
    const imageExtension = filename.split(".").pop();
    const imageFilename = `${Math.floor(
      Math.random() * 10000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFilename);
    const imageToBeUploaded = { filepath, mimeType };
    file.pipe(fs.createWriteStream(filepath));

    file.on("end", async () => {
      try {
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
        const docRef = await db
          .collection("screams") // bb.on("finish", async () => {
          //   try {
          //     // newScream.screamImage = imageUrl;
          //     console.log(imageUrl);

          //     const docRef = await db.collection("screams").add(newScream);
          //     res.status(201).json(newScream);
          //     newScream.screamId = docRef.id;
          //   } catch (error) {
          //     console.error(error);
          //     res.status(500).send("Error while saving scream to Firestore.");
          //   }
          // });
          .add({ ...newScream, screamImage: imageUrl });
        res
          .status(201)
          .json({ ...newScream, screamImage: imageUrl, screamId: docRef.id });
        // newScream.screamImage = imageUrl;
      } catch (error) {
        console.error(error);
        res.status(500).send("Error while uploading file.");
      }
    });
  });
  // bb.on("finish", async () => {
  //   try {
  //     // newScream.screamImage = imageUrl;
  //     console.log(imageUrl);

  //     const docRef = await db.collection("screams").add(newScream);
  //     res.status(201).json(newScream);
  //     newScream.screamId = docRef.id;
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send("Error while saving scream to Firestore.");
  //   }
  // });
  bb.on("error", () => {
    console.error("busboy error");
    res.status(500).send("error while creating a scream!");
  });
  bb.end(req.rawBody);
};

// comment on scream
exports.addCommentScream = async (req, res) => {
  const newComment = {
    userHandle: req.user.handle,
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

    await db.runTransaction((transaction) => {
      transaction.set(db.collection("comments").doc(), newComment);
      const updatedScreamComments = screamSnap.data().commentCount + 1;
      transaction.update(screamDoc, { commentCount: updatedScreamComments });
      return Promise.resolve();
    });
    return res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while commenting on a scream.");
  }
};

exports.likeScream = async (req, res) => {
  try {
    const screamDoc = db.doc(`/screams/${req.params.screamId}`);
    const screamSnap = await screamDoc.get();
    const likeSnap = await db
      .collection("likes")
      .where("screamId", "==", req.params.screamId)
      .where("userHandle", "==", req.user.handle)
      .get();
    if (!screamSnap.exists) {
      return res.status(404).json({ error: "Scream not found." });
    }
    if (likeSnap.docs.length > 0) {
      return res
        .status(400)
        .json({ error: "Scream already liked by this user." });
    }

    await db.runTransaction(async (transaction) => {
      transaction.set(db.collection("likes").doc(), {
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString(),
        profileImage: req.user.profileImage,
      });

      const updatedLikeCount = screamSnap.data().likeCount + 1;
      transaction.update(screamDoc, { likeCount: updatedLikeCount });
      return Promise.resolve();
    });

    return res.status(201).json({
      ...screamSnap.data(),
      likeCount: screamSnap.data().likeCount + 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while liking a scream.");
  }
};

exports.unlikeScream = async (req, res) => {
  try {
    const screamDoc = db.doc(`/screams/${req.params.screamId}`);
    const screamSnap = await screamDoc.get();
    const likeSnap = await db
      .collection("likes")
      .where("screamId", "==", req.params.screamId)
      .where("userHandle", "==", req.user.handle)
      .get();
    if (!screamSnap.exists) {
      return res.status(404).json({ error: "Scream not found." });
    }
    if (likeSnap.docs.length === 0 || screamSnap.data().likeCount === 0) {
      return res.status(400).json({ error: "Scream already not liked" });
    }

    await db.runTransaction(async (transaction) => {
      transaction.delete(likeSnap.docs[0].ref);

      const updatedLikeCount = screamSnap.data().likeCount - 1;
      transaction.update(screamDoc, { likeCount: updatedLikeCount });
      return Promise.resolve();
    });

    return res.status(201).json({
      ...screamSnap.data(),
      likeCount: !screamSnap.data().likeCount
        ? 0
        : screamSnap.data().likeCount - 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while liking a scream.");
  }
};

exports.deleteScream = async (req, res) => {
  try {
    const screamDoc = db.doc(`/screams/${req.params.screamId}`);
    const screamSnap = await screamDoc.get();
    const butch = db.batch();
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
      await butch.commit();
      return res.status(200).json({ message: "Scream deleted successfully." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting scream.");
  }
};
