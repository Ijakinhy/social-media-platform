const { admin } = require("./admin");

const busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { config } = require("./config");

const uploadImage = (req) => {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers });
    let imageFilename;
    let imageToBeUploaded = {};

    bb.on("file", (name, file, info) => {
      const { filename, encoding, mimetype } = info;
      if (mimetype !== "image/png" && mimetype !== "image/jpeg") {
        return reject("Wrong image type submitted");
      }
      const imageExtension = filename.split(".").pop();
      imageFilename = `${Math.floor(
        Math.random() * 1000000
      )}.${imageExtension}`;
      const filepath = path.join(os.tmpdir(), imageFilename);
      imageToBeUploaded = { filepath, mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    bb.on("finish", async () => {
      try {
        await admin
          .storage()
          .bucket()
          .upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
              metadata: {
                "Content-Type": imageToBeUploaded.mimetype,
              },
            },
          });
        const imageUrl = `http://127.0.0.1:9199/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`;
        resolve(imageUrl);
      } catch (error) {
        console.log("error while uploading image", error);
        reject(error);
      }
    });
    bb.on("error", (err) => {
      console.log("busboy error", err);
      reject(err);
    });
    bb.end(req.rawBody);
  });
};

module.exports = { uploadImage };
