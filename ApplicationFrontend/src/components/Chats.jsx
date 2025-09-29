import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../firebase";
import { changeChat, setIsChatsOpen, setIsMessageModelOpen } from "../redux/chatSlice";
import AddUserChat from "./AddUserChat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
const Chats = () => {
  const dispatch = useDispatch();
  const [chats, setChats] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const { credentials: currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    if(!currentUser.userId) return
    const unSub = onSnapshot(
      doc(db, "userChats", currentUser.userId),
      async (res) => {
        const items = res.data()?.chats || [];
        if(!items.length) return

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return {
            ...item,
            user,
          };
        });

        const chatData = await Promise.all(promises);
        const sortedData = chatData.sort((a, b) => b.updatedAt - a.updatedAt);

        setChats(sortedData);
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.userId]);

  
  const handleSelectChat = async (chat) => {
     dispatch(setIsMessageModelOpen(true));
    dispatch(setIsChatsOpen(false));
    const userChats = chats.map((item) => {
      const { user, ...rest } = item  
      return rest;
    });
    
    
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;
    try {
        await updateDoc(doc(db, "userChats", currentUser.userId), {
          chats: userChats,
        });
      const user =  (await getDoc(doc(db, "users", chat.receiverId))).data();
      dispatch(
        changeChat({ chatId: chat.chatId, user: user, currentUser,chat })
      );
      
    } catch (error) {
      console.log(error);
    }
  };
  // const filteredChats = chats.filter((chat) =>
  //   chat.user.username.toLowerCase().includes(searchInput.toLowerCase())
  // );

  // console.log(chats);
  
          // console.log(chats[0].user.handle);
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


  return (
    <>
    <AddUserChat/>
      <div>
        <h1 className="text-2xl font-bold text-gray-100 ml-12 mb-3 ">Chats</h1>
        <div className="flex  justify-between">

        <div className="flex-row relative flex items-center mb-9 ">
          <input
            className={`border-white rounded-full border-none  pl-10 py-1 focus:outline-none text-[18px] bg-gray-400/20 text-white w-[280px]`}
            placeholder="Search"
            type="text"
          />
          <FaSearch
            className={`absolute  inset-0 inset-x-4 inset-y-2 text-gray-400`}
            size={16}
          />
        </div>
          <label htmlFor="my_modal_7" className="text-gray-100 mt-2 cursor-pointer">
            <FaPlus />
            </label>
        </div>
        {/* Chats */}
         {chats.map((chat) => {
          
           return (<div
           key={chat.chatId}
          className={`  flex mt-2   mr-3 relative group/parent bg-[#0c1317] transition-all ease-out p-1.5 rounded-lg justify-between items-center    `}
          onClick={()=> handleSelectChat(chat)}
        >
          <div className="flex items-center  ">
            {chat.senderId !== currentUser.userId && (
              <div className="w-16 rounded-full">
              <img
                src={chat.avatar}
                alt="recipient profile"
                className="w-full rounded-full"
              />
            </div>
            )}
            <div className="flex  flex-col ml-3">
              <h5 className="text-gray-100 font-normal  capitalize m">
                {chat.user.handle}
              </h5>
              <p className="text-gray-300 text-sm -serif">
                You: <span>{chat.lastMessage}</span> . {dayjs(chat.updatedAt).fromNow(true)}
              </p>
            </div>
          </div>
          {/* <span className="text-slate-900  absolute top-1 right-2  px-1 py-0.5 font-bold rounded-full font-afacad  bg-[#00A884]">
            20
          </span>
          <FaChevronDown className="text-gray-200 text-sm absolute bottom-1 cursor-pointer right-2  rounded-full opacity-0 group-hover/parent:opacity-100  transition-all pointer-events-none group-hover/parent:pointer-events-auto " /> */}
        </div>
           )
})}
        
      </div>
    </>
  );
};

export default Chats;
