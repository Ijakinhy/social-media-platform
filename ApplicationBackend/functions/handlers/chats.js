const { FieldValue } = require("firebase-admin/firestore");
const { db, admin } = require("../utils/admin");

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
  try {
    const newMessage = {
      text: req.body.text,
      isSeen: false,
      sender: req.user.handle,
      updatedAt: new Date().toISOString(),
      recipient: req.params.recipient,
    };
    const chatRef = db.doc(`/chats/${req.params.recipient}`);
    const chatSnap = await db.doc(`/chats/${req.params.recipient}`).get();
    const notificationsRef = db.collection("notifications").doc();
    await db.runTransaction(async (transaction) => {
      if (!chatSnap.exists) {
        transaction.set(chatRef, {
          messages: FieldValue.arrayUnion({
            text: req.body.text,
            isSeen: false,
            sender: req.user.handle,
            updatedAt: new Date().toISOString(),
            recipient: req.params.recipient,
            // messageId: chatRef.id,
          }),
          lastMessage: newMessage.text,
        });
      } else {
        transaction.update(chatRef, {
          messages: FieldValue.arrayUnion({
            text: req.body.text,
            isSeen: false,
            sender: req.user.handle,
            updatedAt: new Date().toISOString(),
            recipient: req.params.recipient,
            // messageId: chatRef.id,
          }),
          lastMessage: newMessage.text,
        });
      }

      // Send notification to recipient
      transaction.set(notificationsRef, {
        recipient: req.params.recipient,
        sender: req.user.handle,
        type: "message",
        read: false,
        createdAt: new Date().toISOString(),
        notificationId: notificationsRef.id,
      });
    });

    return res.json({ ...newMessage, lastMessage: newMessage.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.markMessageSeen = async (req, res) => {
  try {
    const chatSnap = await db.doc(`/chats/${req.user.handle}`).get();
    if (chatSnap.exists) {
      const messages = chatSnap.data().messages;
      const updatedMessages = messages.map((message) => {
        if (message.recipient === req.user.handle) {
          console.log(message.recipient);

          return { ...message, isSeen: true };
        }
        return message;
      });
      await db
        .doc(`/chats/${req.user.handle}`)
        .update({ messages: updatedMessages });

      return res.json({ message: "seen" });
    }
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

    if (notificationsSnap.empty) {
      return res.json({ message: "no unread notifications" });
    } else {
      notificationsSnap.forEach((doc) => {
        db.doc(`/notifications/${doc.id}`).update({
          read: true,
        });
      });
      return res.json({ message: "seen" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "error happens while marking seen the notification" });
  }
};
