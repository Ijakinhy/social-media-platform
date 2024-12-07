const { db, admin } = require("../utils/admin");
const { uploadImage } = require("../utils/upload");
const busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { config } = require("../utils/config");

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
    console.log(mimeType);

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
        imageUrl = `http://127.0.0.1:9199/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`;
        const docRef = await db
          .collection("screams")
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
