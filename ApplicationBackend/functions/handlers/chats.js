const { db } = require("../utils/admin");
exports.createChat = async (req, res) => {
  try {
    const  chatDocRef = db.collection("chats").doc();
    const userData =  (await db.doc(`/users/${req.user.handle}`).get()).data();
    const userChatDocRef  =  db.collection("chats").doc(userData.userId);
    await db.doc(`/chats`).set({ messages: [] });
    chatDocRef.create({
      createdAt: new Date().toISOString(),
      messages: [],
    })
    res.json({ message: "Chat created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
 try {
  const chatDocRef = db.collection("chats").doc()
  
 } catch (error) {
  console.log(error);
  
  
 }
};

exports.markMessageSeen = async (req, res) => {
  try {
    const chatSnap = await db
      .collection("chats")
      .doc(req.user.handle)
      .collection("messages")
      .where("recipient", "==", req.user.handle)
      .get();
    const batch = db.batch();

    chatSnap.forEach((doc) => {
      batch.update(doc.ref, {
        isSeen: true,
      });
    });
    batch.commit();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "error happens while marking seen the message" });
  }
};

exports.markMessageNotificationRead = async (req, res) => {
  try {
    const notificationsSnap = await db
      .collection("notifications")
      .where("type", "==", "message")
      .where("recipient", "==", req.user.handle)
      .get();
    const batch = db.batch();
    if (notificationsSnap.empty) {
      return res.json({ message: "no unread notifications" });
    } else {
      notificationsSnap.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
        });
      });
      await batch.commit();
      return res.json({ message: "seen" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "error happens while marking seen the notification" });
  }
};
