import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateScream from "../components/CreateScream";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import Scream from "../components/Scream";
import { db } from "../firebase";
import { getAuthenticatedUser } from "../redux/userActions";
import { addNewScream } from "../redux/userSlice";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { AiOutlineSend } from "react-icons/ai";
import jakinImg from "../images/jakin.jpg";
import { IoClose } from "react-icons/io5";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { useClickOutside } from "../utils/hooks";
import { setIsMessageModelOpen } from "../redux/chatSlice";
const Home = () => {
  const dispatch = useDispatch();
      const [openEmoji, setOpenEmoji] = useState(false);
  const [messages, setmessages] = useState({
    messages:[],
    createdAt: null
  });
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const app = useSelector((state) => state.user.loading.app);
  const screams = useSelector((state) => state.user.screams);
  const credentials = useSelector((state) => state.user.credentials);
  const notifications = useSelector((state) => state.user.notifications);
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




  const endRef = useRef();
  const { chatId, user,chat, isCurrentUserBlocked, isReceiverBlocked } = useSelector(
    (state) => state.chats
  );
  const { credentials: currentUser } = useSelector((state) => state.user);
  
  // useEffect(() => endRef.current.scrollIntoView({ behavior: "smooth" }), []);
  useEffect(() => {
    if(!chatId) {
      dispatch(setIsMessageModelOpen(false));
      return
    }     
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setmessages(res.data());
    });
   
    return () => {
      unSub();
    };
    
  }, [chatId])  
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (text === "") return;
    let imgURL = null;
    try {

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          createdAt: new Date(),
          text: text,
          senderId: currentUser.userId,
        }),
      });
      const userIDs = [user.userId, currentUser.userId];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapShot = await getDoc(userChatsRef);

        if (userChatsSnapShot.exists()) {
          const userChatsData = userChatsSnapShot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (item) => item.chatId === chatId
          );
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.userId ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error.message);
    }finally {
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
            <div className="bg-bgCard flex  flex-col fixed bottom-0 right-24 xs:right-8 md:right-12 h-[30rem] w-[24rem] rounded-xl">
              {/* //  message header  */}
              <div className="p-2.5 flex items-center   justify-between ">
                <div className="flex items-center cursor-pointer">
                  <div className="chat-image avatar mr-3">
                    <div className="w-10 rounded-full">
                      <img
                        alt="Tailwind CSS chat bubble component"
                        src={user.profileImage}
                      />
                    </div>
                  </div>
                  <h5 className="text-gray-300 text-lg ">{user.handle + " " + user.lastName}</h5>
                </div>
                <button
                  className="px-1 py-1 rounded-full hover:bg-accent transition-all duration-300"
                  onClick={() => dispatch(setIsMessageModelOpen(false))}
                >
                  <IoClose className="text-gray-300 text-2xl" />
                </button>
              </div>
              {/* /// text   messages  */}
              <div className=" w-[100%] h-[0.1px] bg-gray-400/25 relative" />
              <div className="flex-1 overflow-y-auto pt-4 px-2">
                <div className="max-h-[1000px]   ">
                  <div className="flex  flex-col">
                    {messages.messages.map((message,index)=> {
                      return(

                       <div key={index} className={ `flex ${message.senderId === currentUser.userId ? "justify-end mt-4" : ""} `}>
                      {message.senderId !== currentUser.userId && (
                        <div className="w-10 mr-1 ">
                        <img
                          className="rounded-full"
                          alt="Tailwind CSS chat bubble component"
                          src={user.profileImage}
                        />
                      </div>
                      )}
                         <div className={` ${message.senderId === currentUser.userId ? "bg-[#1d2c35]" : "bg-[#0c1317]"} px-2 py-1.5 rounded-xl max-w-[70%] leading-none`}>
                        <div>
                          <p className="w-fit font-sans leading-none  text-white">
                            {message.text}
                          </p>
                           {
                            message.senderId === currentUser.userId ? (
                               <div className="flex justify-end mt-1 gap-1 items-center  ">
                          <small className="text-white ">07:20AM</small>
                          <IoCheckmarkDoneOutline className={`text-lg ${chat.isSeen? "text-green-500" : "text-white"}`} />
                        </div>
                            ) : (
                              <small className="text-white float-left mt-1">
                                07:20AM
                              </small>
                            )
                           }
                         
                        </div>
                      </div>
                    </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* ///  message footer  */}

              <div className="flex  h-20 flex-col   w-[24rem]  z-[100] shadow-inner  absolute  bottom-0    ">
                <div className=" w-[100%] h-[0.2px] bg-gray-300/20 " />
                <form onSubmit={handleSendMessage} className="flex items-center justify-between mx-3 my-auto  rounded-xl bg-gray-300/5  ">
                  <input
                    onChange={(e) => setText(e.target.value)}
                    className=" px-2 py-1   rounded-md border-none bg-transparent focus:outline-none focus:border-accent
                   text-gray-100"
                    name="message"
                    type="text"
                    autoComplete="off"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="w-12 h-10 ml-2 rounded-md  border-none "
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
