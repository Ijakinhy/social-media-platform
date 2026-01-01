import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { IoCheckmarkDoneOutline, IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import CreateScream from "../components/CreateScream";
import Profile from "../components/Profile";
import Scream from "../components/Scream";
import { db } from "../firebase";
import { setIsMessageModelOpen, setChatId } from "../redux/chatSlice";
import { addNewScream } from "../redux/userSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import axios from "axios";
const Home = () => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const app = useSelector((state) => state.user.loading.app);
  const screams = useSelector((state) => state.user.screams);
  const credentials = useSelector((state) => state.user.credentials);
  const isMessageModelOpen = useSelector(
    (state) => state.chats.isMessageModelOpen
  );

  const memoiseScreams = useMemo(() => screams, [screams]);

  // / event listener for created scream

  useEffect(() => {
    let IsInitialSnap = true;

    const screamCollection = collection(db, "screams");
    const screamsColQuery = query(
      screamCollection,
      orderBy("createdAt", "desc")
    );

    const unsubscribeScream = onSnapshot(screamsColQuery, (snapshot) => {
      if (IsInitialSnap) {
        IsInitialSnap = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        // const currentData = change.doc.data();
        if (change.type === "added") {
          const newScream = { ...change.doc.data(), screamId: change.doc.id };
          if (newScream.userHandle !== credentials.handle) {
            dispatch(addNewScream(newScream));
          }
        }
      });
    });

    return () => {
      unsubscribeScream();
    };
  }, [dispatch]);




  const { chatId, user, isNewChat } = useSelector((state) => state.chats);
  const { credentials: currentUser } = useSelector((state) => state.user);
  
  // Listen to messages subcollection for real-time updates
  useEffect(() => {
    // For new chats (no chatId yet), just clear messages and keep modal open
    if (!chatId) {
      if (!isNewChat) {
        dispatch(setIsMessageModelOpen(false));
      }
      setMessages([]);
      return;
    }

    // Mark messages as seen when chat opens (for read receipts)
    axios.post(`/api/chat/${chatId}/markSeen`).catch((err) => {
      console.error("Error marking messages as seen:", err);
    });

    // Query messages subcollection ordered by createdAt
    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));

    const unSub = onSnapshot(messagesQuery, (snapshot) => {
      // Always rebuild full list to ensure isSeen updates are captured
      const messagesList = [];
      snapshot.forEach((doc) => {
        messagesList.push({
          messageId: doc.id,
          ...doc.data(),
        });
      });
      setMessages(messagesList);
    });

    return () => {
      unSub();
    };
  }, [chatId, isNewChat, dispatch]);

  dayjs.extend(relativeTime);
    dayjs.extend(updateLocale);
    dayjs.updateLocale("en", {
      relativeTime: {
        future: "in %s",
        past: "%s ",
        s: "a few seconds ",
        ss: "%d sec",
        m: "1 min ",
        mm: "%dmin ",
        h: "1h ",
        hh: "%dh ",
        d: "1d ",
        dd: "%dd ",
        M: "1m ",
        MM: "%dm ",
        y: "1d",
        yy: (value) => {
          const yearsAgo = dayjs().subtract(value, "year");
          return yearsAgo.format("MMMM D, YYYY");
        },
      },
    });


  // Helper function to create a new chat with first message
  const createNewChatWithMessage = async (messageText, now, nowTimestamp) => {
    // Create new chat document
    const chatRef = doc(collection(db, "chats"));
    const newChatId = chatRef.id;

    await setDoc(chatRef, {
      participants: [currentUser.userId, user.userId],
      createdAt: now,
      updatedAt: now,
      lastMessage: {
        text: messageText,
        senderId: currentUser.userId,
        createdAt: now,
      },
    });

    // Create first message in subcollection
    const messagesRef = collection(db, "chats", newChatId, "messages");
    await addDoc(messagesRef, {
      text: messageText,
      senderId: currentUser.userId,
      recipientId: user.userId,
      createdAt: now,
      isSeen: false,
    });

    // Create userChats entry for recipient
    await setDoc(
      doc(db, "userChats", user.userId),
      {
        chats: arrayUnion({
          chatId: newChatId,
          lastMessage: messageText,
          recipientId: currentUser.userId,
          recipientHandle: currentUser.handle,
          recipientAvatar: currentUser.profileImage,
          updatedAt: nowTimestamp,
          isSeen: false,
        }),
      },
      { merge: true }
    );

    // Create userChats entry for current user
    await setDoc(
      doc(db, "userChats", currentUser.userId),
      {
        chats: arrayUnion({
          chatId: newChatId,
          lastMessage: messageText,
          recipientId: user.userId,
          recipientHandle: user.handle,
          recipientAvatar: user.profileImage,
          updatedAt: nowTimestamp,
          isSeen: true,
        }),
      },
      { merge: true }
    );

    return newChatId;
  };

  // Helper function to add message to existing chat
  const addMessageToExistingChat = async (currentChatId, messageText, now, nowTimestamp) => {
    // Add message to subcollection
    const messagesRef = collection(db, "chats", currentChatId, "messages");
    await addDoc(messagesRef, {
      text: messageText,
      senderId: currentUser.userId,
      recipientId: user.userId,
      createdAt: now,
      isSeen: false,
    });

    // Update chat document with lastMessage
    await updateDoc(doc(db, "chats", currentChatId), {
      lastMessage: {
        text: messageText,
        senderId: currentUser.userId,
        createdAt: now,
      },
      updatedAt: now,
    });

    // Update userChats for both users
    const userIDs = [user.userId, currentUser.userId];
    for (const id of userIDs) {
      const userChatsRef = doc(db, "userChats", id);
      const userChatsSnapShot = await getDoc(userChatsRef);

      if (userChatsSnapShot.exists()) {
        const userChatsData = userChatsSnapShot.data();
        const chatIndex = userChatsData.chats.findIndex(
          (item) => item.chatId === currentChatId
        );

        if (chatIndex !== -1) {
          userChatsData.chats[chatIndex].lastMessage = messageText;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.userId;
          userChatsData.chats[chatIndex].updatedAt = nowTimestamp;

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (text.trim() === "") return;

    const now = new Date().toISOString();
    const nowTimestamp = Date.now();
    const messageText = text.trim();

    try {
      if (isNewChat && !chatId) {
        // Create new chat with first message
        const newChatId = await createNewChatWithMessage(messageText, now, nowTimestamp);
        // Update Redux with the new chatId
        dispatch(setChatId(newChatId));
      } else {
        // Add message to existing chat
        await addMessageToExistingChat(chatId, messageText, now, nowTimestamp);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setText("");
    }
  };
  

  return (
    <>
      {app ? (
        <div className="relative">
          <div className="text-center  translate-y-3/4 ">
            <div className="w-16 h-16 border-8  border-dashed rounded-full animate-spin border-yellow-500  mx-auto"></div>
            <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Your adventure is about to begin
            </p>
          </div>
        </div>
      ) : (
        <div className="h-full relative">
          <div className=" relative flex sm:justify-evenly justify-center  ">
            {/* /// profile  */}
            <Profile credentials={credentials} page={"home"} />
            <div className="">
              {/* ///  create card  post  */}
              <CreateScream />
              {/* ///  scream  Card */}
              {memoiseScreams.map((scream) => (
                <Scream key={scream.screamId} scream={scream} />
              ))}
            </div>
          </div>

          {/*   chats messages  */}
          {isMessageModelOpen && (
            <div className="bg-bgCard flex flex-col fixed bottom-0 right-24 xs:right-8 md:right-12 h-[30rem] w-[24rem] rounded-xl overflow-hidden">
              {/* //  message header - fixed at top */}
              <div className="flex-shrink-0 p-2.5 flex items-center justify-between border-b border-gray-400/25">
                <div className="flex items-center cursor-pointer">
                  <div className="chat-image avatar mr-3">
                    <div className="w-10 rounded-full">
                      <img
                        alt="Tailwind CSS chat bubble component"
                        src={user.profileImage}
                      />
                    </div>
                  </div>
                  <h5 className="text-gray-300 text-lg">{user.handle}</h5>
                </div>
                <button
                  className="px-1 py-1 rounded-full hover:bg-accent transition-all duration-300"
                  onClick={() => dispatch(setIsMessageModelOpen(false))}
                >
                  <IoClose className="text-gray-300 text-2xl" />
                </button>
              </div>

              {/* /// text messages - scrollable middle */}
              <div className="flex-1 overflow-y-auto px-2 py-4">
                <div className="flex flex-col gap-2">
                  {messages.map((message) => (
                    <div key={message.messageId} className={`flex ${message.senderId === currentUser.userId ? "justify-end" : ""}`}>
                      {message.senderId !== currentUser.userId && (
                        <div className="w-10 mr-1 flex-shrink-0">
                          <img
                            className="rounded-full"
                            alt="Tailwind CSS chat bubble component"
                            src={user.profileImage}
                          />
                        </div>
                      )}
                      <div className={`${message.senderId === currentUser.userId ? "bg-[#1d2c35]" : "bg-[#0c1317]"} px-2 py-1.5 rounded-xl max-w-[70%]`}>
                        <p className="font-sans text-white break-words">
                          {message.text}
                        </p>
                        {message.senderId === currentUser.userId ? (
                          <div className="flex justify-end mt-1 gap-1 items-center">
                            <small className="text-gray-400 text-xs">{dayjs(message.createdAt).fromNow(true)}</small>
                            <IoCheckmarkDoneOutline className={`text-lg ${message.isSeen ? "text-green-500" : "text-gray-400"}`} />
                          </div>
                        ) : (
                          <small className="text-gray-400 text-xs block mt-1">
                            {dayjs(message.createdAt).fromNow(true)}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ///  message footer - fixed at bottom */}
              <div className="flex-shrink-0 border-t border-gray-300/20 p-3">
                <form onSubmit={handleSendMessage} className="flex items-center rounded-xl bg-gray-300/5">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border-none bg-transparent focus:outline-none text-gray-100"
                    name="message"
                    type="text"
                    autoComplete="off"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="w-12 h-10 rounded-md border-none flex items-center justify-center"
                  >
                    <AiOutlineSend className="text-white text-2xl" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Home;
