const { db, admin } = require("../utils/admin");

// Create a new chat between two users
exports.createChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.authUser.userId;

    // Validation
    if (!recipientId) {
      return res.status(400).json({ error: "recipientId is required" });
    }

    if (recipientId === senderId) {
      return res.status(400).json({ error: "Cannot create chat with yourself" });
    }

    // Check if recipient exists
    const recipientDoc = await db.doc(`/users/${recipientId}`).get();
    if (!recipientDoc.exists) {
      return res.status(404).json({ error: "Recipient user not found" });
    }
    const recipientData = recipientDoc.data();

    // Check if chat already exists between these users
    const existingChat = await db
      .collection("chats")
      .where("participants", "array-contains", senderId)
      .get();

    let existingChatId = null;
    existingChat.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(recipientId)) {
        existingChatId = doc.id;
      }
    });

    if (existingChatId) {
      return res.status(200).json({
        chatId: existingChatId,
        message: "Chat already exists",
      });
    }

    // Get sender data
    const senderDoc = await db.doc(`/users/${senderId}`).get();
    const senderData = senderDoc.data();

    // Create new chat document
    const chatRef = db.collection("chats").doc();
    const now = new Date().toISOString();
    const nowTimestamp = Date.now();

    await chatRef.set({
      participants: [senderId, recipientId],
      createdAt: now,
      updatedAt: now,
      lastMessage: null,
    });

    // Update userChats for both users
    const batch = db.batch();

    // Sender's userChats
    const senderChatRef = db.doc(`/userChats/${senderId}`);
    batch.set(
      senderChatRef,
      {
        chats: admin.firestore.FieldValue.arrayUnion({
          chatId: chatRef.id,
          recipientId: recipientId,
          recipientHandle: recipientData.handle,
          recipientAvatar: recipientData.profileImage,
          lastMessage: null,
          updatedAt: nowTimestamp,
          isSeen: true,
        }),
      },
      { merge: true }
    );

    // Recipient's userChats
    const recipientChatRef = db.doc(`/userChats/${recipientId}`);
    batch.set(
      recipientChatRef,
      {
        chats: admin.firestore.FieldValue.arrayUnion({
          chatId: chatRef.id,
          recipientId: senderId,
          recipientHandle: senderData.handle,
          recipientAvatar: senderData.profileImage,
          lastMessage: null,
          updatedAt: nowTimestamp,
          isSeen: true,
        }),
      },
      { merge: true }
    );

    await batch.commit();

    return res.status(201).json({
      chatId: chatRef.id,
      message: "Chat created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const senderId = req.authUser.userId;

    // Validation
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Message text is required" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "chatId is required" });
    }

    // Verify chat exists and user is participant
    const chatDoc = await db.doc(`/chats/${chatId}`).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants.includes(senderId)) {
      return res.status(403).json({ error: "Not authorized to send to this chat" });
    }

    // Get recipient ID
    const recipientId = chatData.participants.find((id) => id !== senderId);

    // Check if recipient has blocked sender
    const recipientDoc = await db.doc(`/users/${recipientId}`).get();
    const recipientData = recipientDoc.data();
    if (recipientData.blocked && recipientData.blocked.includes(senderId)) {
      return res.status(403).json({ error: "Cannot send message to this user" });
    }

    const now = new Date().toISOString();
    const nowTimestamp = Date.now();

    // Create message in subcollection
    const messageRef = db.collection("chats").doc(chatId).collection("messages").doc();
    const messageData = {
      text: text.trim(),
      senderId: senderId,
      recipientId: recipientId,
      createdAt: now,
      isSeen: false,
    };

    await messageRef.set(messageData);

    // Update chat document with lastMessage
    await db.doc(`/chats/${chatId}`).update({
      lastMessage: {
        text: text.trim(),
        senderId: senderId,
        createdAt: now,
      },
      updatedAt: now,
    });

    // Update userChats for both users
    await updateUserChatsOnMessage(senderId, recipientId, chatId, text.trim(), nowTimestamp);

    return res.status(201).json({
      messageId: messageRef.id,
      ...messageData,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Helper function to update userChats when a message is sent
async function updateUserChatsOnMessage(senderId, recipientId, chatId, text, timestamp) {
  const userIds = [senderId, recipientId];

  for (const userId of userIds) {
    const userChatsRef = db.doc(`/userChats/${userId}`);
    const userChatsDoc = await userChatsRef.get();

    if (userChatsDoc.exists) {
      const userChatsData = userChatsDoc.data();
      const chats = userChatsData.chats || [];

      const chatIndex = chats.findIndex((c) => c.chatId === chatId);
      if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = text;
        chats[chatIndex].updatedAt = timestamp;

        if (userId === senderId) {
          chats[chatIndex].isSeen = true;
        } else {
          chats[chatIndex].isSeen = false;
        }

        await userChatsRef.update({ chats: chats });
      }
    }
  }
}

// Get messages from a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.authUser.userId;
    const limit = parseInt(req.query.limit) || 50;

    // Verify chat exists and user is participant
    const chatDoc = await db.doc(`/chats/${chatId}`).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants.includes(userId)) {
      return res.status(403).json({ error: "Not authorized to view this chat" });
    }

    // Query messages
    const messagesSnap = await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();

    const messages = [];
    messagesSnap.forEach((doc) => {
      messages.push({
        messageId: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      messages: messages,
      chatId: chatId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Mark messages as seen in a chat
exports.markMessageSeen = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.authUser.userId;

    // Verify chat exists and user is participant
    const chatDoc = await db.doc(`/chats/${chatId}`).get();
    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();
    if (!chatData.participants.includes(userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Mark all unread messages as seen
    const messagesSnap = await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .where("recipientId", "==", userId)
      .where("isSeen", "==", false)
      .get();

    if (!messagesSnap.empty) {
      const batch = db.batch();
      messagesSnap.forEach((doc) => {
        batch.update(doc.ref, { isSeen: true });
      });
      await batch.commit();
    }

    // Update userChats isSeen
    const userChatsRef = db.doc(`/userChats/${userId}`);
    const userChatsDoc = await userChatsRef.get();

    if (userChatsDoc.exists) {
      const userChatsData = userChatsDoc.data();
      const chats = userChatsData.chats || [];
      const chatIndex = chats.findIndex((c) => c.chatId === chatId);

      if (chatIndex !== -1) {
        chats[chatIndex].isSeen = true;
        await userChatsRef.update({ chats: chats });
      }
    }

    return res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// Mark message notifications as read
exports.markMessageNotificationRead = async (req, res) => {
  try {
    const notificationsSnap = await db
      .collection("notifications")
      .where("type", "==", "message")
      .where("recipient", "==", req.authUser.userId)
      .get();

    if (notificationsSnap.empty) {
      return res.json({ message: "No unread notifications" });
    }

    const batch = db.batch();
    notificationsSnap.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();

    return res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error marking notifications as read" });
  }
};
