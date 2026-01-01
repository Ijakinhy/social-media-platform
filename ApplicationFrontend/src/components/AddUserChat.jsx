import { collection, doc, getDoc, getDocs, orderBy, query, startAt, endAt, where } from 'firebase/firestore';
import { useState } from 'react';
import { FaX } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { db } from '../firebase';
import { startNewChat, setIsMessageModelOpen, changeChat, setIsChatsOpen } from '../redux/chatSlice';

const AddUserChat = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const { credentials: currentUser } = useSelector((state) => state.user);

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchText = e.target.value;

    if (!searchText) {
      setUsers([]);
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        orderBy("handle"),
        startAt(searchText),
        endAt(searchText + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Filter out current user from search results
        const foundUsers = querySnapshot.docs
          .map(doc => doc.data())
          .filter(user => user.userId !== currentUser.userId);
        setUsers(foundUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching:", error.message);
    }
  };

  const handleAdd = async (selectedUser) => {
    try {
      // Check if a chat already exists between these users
      const chatsRef = collection(db, "chats");
      const existingChatQuery = query(
        chatsRef,
        where("participants", "array-contains", currentUser.userId)
      );
      const existingChatsSnap = await getDocs(existingChatQuery);

      let existingChatId = null;
      existingChatsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(selectedUser.userId)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        // Chat already exists - open it
        const userDoc = await getDoc(doc(db, "users", selectedUser.userId));
        const userData = userDoc.data();

        dispatch(setIsChatsOpen(false));
        dispatch(changeChat({
          chatId: existingChatId,
          user: userData,
          currentUser,
          chat: {}
        }));
        dispatch(setIsMessageModelOpen(true));
      } else {
        // No existing chat - start a new one (lazy creation)
        // Don't create anything in database yet - just set up the UI
        dispatch(setIsChatsOpen(false));
        dispatch(startNewChat({ user: selectedUser }));
        dispatch(setIsMessageModelOpen(true));
      }

      // Clear search results
      setUsers([]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <input type="checkbox" id="my_modal_7" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-slate-700 font-semibold">Add New User Chat</h1>
              <p className="text-gray-400 text-sm">Search a user to start a chat</p>
            </div>
            <label
              htmlFor="my_modal_7"
              className="btn btn-ghost absolute right-2 top-2"
              onClick={() => setUsers([])}
            >
              <FaX />
            </label>
          </div>
          <div className="relative w-full max-w-xl my-5 mx-auto bg-white rounded-full">
            <input
              placeholder="Search for a user..."
              onChange={handleSearch}
              className="rounded-full w-full h-16 bg-transparent py-2 pl-8 pr-32 outline-none border-2 border-gray-100 shadow-md hover:outline-none focus:ring-teal-200 focus:border-teal-200"
              type="text"
              name="query"
              id="query"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Users</h2>
            {users.map((user) => (
              <label
                htmlFor="my_modal_7"
                onClick={() => handleAdd(user)}
                key={user.userId}
              >
                <div className="space-y-4 cursor-pointer">
                  <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg transition-all duration-300 hover:bg-indigo-100">
                    <img
                      src={user.profileImage}
                      alt={user.handle}
                      className="w-12 h-12 rounded-full border-2 border-indigo-800"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-800">
                        {user.handle}
                      </h3>
                      <p className="text-sm text-gray-600">{user.joinedAt}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserChat;
