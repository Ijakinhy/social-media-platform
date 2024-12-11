const { FieldValue } = require("firebase-admin/firestore");
const { db, admin } = require("../utils/admin");
const functions = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
exports.createChat = async (req, res) => {
  try {
    await db.doc(`/chats/${req.user.handle}`).set({ messages: [] });
    res.json({ message: "Chat created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  const newMessage = {
    text: req.body.text,
    isSeen: false,
    recipient: req.params.recipient,
    updatedAt: new Date().toISOString(),
    sender: req.user.handle,
  };
  const chatsRefId = await db
    .collection("chats")
    .doc(req.params.recipient)
    .collection("messages")
    .get();

  try {
    if (!newMessage.text) {
      return res.status(400).json({ error: "empty message" });
    }
    if (!newMessage.recipient) {
      return res.status(400).json({ error: "recipient is required" });
    }
    console.log(chatsRefId.size);

    const messageRef = await db
      .collection("chats")
      .doc(req.user.handle)
      .collection("messages")
      .add(newMessage);

    return res.status(201).json({
      ...newMessage,
      messageId: messageRef.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
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
