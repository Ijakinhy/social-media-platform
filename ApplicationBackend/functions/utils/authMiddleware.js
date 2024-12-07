const { admin, db } = require("./admin");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.exp < new Date.now()) {
      console.log("token expired");
    }
    if (!decodedToken) {
      throw new Error("No token provided.");
    }
    console.log(req.user);

    req.user = decodedToken;
    const userRef = await db
      .collection("users")
      .where("userId", "==", decodedToken.uid)
      .limit(1)
      .get();
    req.user.handle = userRef.docs[0].data().handle;

    req.user.profileImage = userRef.docs[0].data().profileImage;

    return next();
  } catch (error) {
    return res.status(403).json({ error: error.code });
  }
};
