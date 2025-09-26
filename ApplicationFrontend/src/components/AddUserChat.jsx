import { arrayUnion, collection, doc, endAt, getDocs, orderBy, query, serverTimestamp, setDoc, startAt, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { FaX } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { db } from '../firebase';

const AddUserChat = () => {
    const [user, setUser] = useState([]);
  const {credentials:currentUser } = useSelector((state) => state.user);
const handleSearch = async (e) => {
  e.preventDefault();
  const searchText = e.target.value;

  if (!searchText) return;

  try {
    // For prefix search (usernames starting with searchText):
    const q = query(
      collection(db, "users"),
      orderBy("handle"),
      startAt(searchText),
      endAt(searchText + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);
    
    

    if (!querySnapshot.empty) {
      // If you expect multiple matches:
      const users = querySnapshot.docs.map(doc => doc.data());
      
      setUser(users); 
      
    } else {
      setUser([]); // no results
    }
  } catch (error) {
    console.error("Error searching:", error.message);
  }
};

const handleAdd = async (selectuser) => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userChats");
    
    try {
        const newChatRef = doc(chatRef);
        await setDoc(newChatRef, {
            createAt: new Date(),
            messages: [],
        });
        console.log(user);
      await updateDoc(doc(userChatRef, selectuser.userId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: null,
          receiverId: currentUser.userId,
          avatar: currentUser.profileImage,
              updatedAt: Date.now(),
        }),
      });
      await updateDoc(doc(userChatRef, currentUser.userId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: null,
          receiverId: selectuser.userId,
          avatar: selectuser.profileImage,
          updatedAt: Date.now(),
        }),
      });
    //   setAddMode(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
<input type="checkbox" id="my_modal_7" className="modal-toggle" />
<div className="modal" role="dialog">
  <div className="modal-box">
    <div className='flex items-center justify-between'>
       <div>
         <h1 className='text-2xl text-slate-700 font-semibold'>Add New User Chat</h1>
    <p className='text-gray-400 text-sm'>Search a user to start a chat</p>
       </div>
    <label htmlFor="my_modal_7" className="btn btn-ghost absolute right-2 top-2" onClick={()=> {setUser([])}}>
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
            {user.map((user) => (
                <label  htmlFor="my_modal_7" onClick={() => handleAdd(user)} key={user.userId}>
                <div className="space-y-4 cursor-pointer"  >
                <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg transition-all duration-300 hover:bg-indigo-100 ">
                    <img src={user.profileImage} alt="Sarah Johnson" className="w-12 h-12 rounded-full border-2 border-indigo-800"/>
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-800">{user.handle + " " + user.lastName}</h3>
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
  )
}

export default AddUserChat