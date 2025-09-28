const { admin, db } = require("./admin");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;

    const userRef = await db
      .collection("users")
      .where("userId", "==", decodedToken.uid)
      .limit(1)
      .get();

    if (userRef.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    req.authUser = userRef.docs[0].data();
    req.user.handle = userRef.docs[0].data().userId;
    req.user.profileImage = userRef.docs[0].data().profileImage;

    return next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({ error: error.code || "Forbidden" });
  }
};
