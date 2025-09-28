import React, { useEffect, useRef, useState } from "react";
import { FaHome, FaSearch } from "react-icons/fa";
import { FaChair, FaFacebookMessenger } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logo.jpg";
import logoutIcon from "../images/logOutIcon.png";
import { readNotifications } from "../redux/userActions";
import NotIcon from "../utils/NotIcon";
import Notification from "./Notification";
import { addLikeNotification, deleteNotificationOnUnlike, toggleNotificationModal } from "../redux/userSlice";
import axios from "axios";
import { useClickOutside } from "../utils/hooks";
import Chats from "./Chats";
import { setIsChatsOpen } from "../redux/chatSlice";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
const Navbar = () => {
  const {
    isOpen,
    setIsOpen,
    ref,
    logOutDropdownRef,
    setIsDropdownOpen,
    isDropdownOpen,
    chatRef,
  } = useClickOutside();
  const [alreadyNotRead, setAlreadyNotRead] = useState(false);
  const isChatsOpen = useSelector((state) => state.chats.isChatsOpen);

  const { credentials, notifications } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notReadNots = notifications?.filter(
    (notification) => !notification.read
  );

  const handleReadNotification = () => {
    if (!alreadyNotRead && notReadNots.length > 0) {
      dispatch(readNotifications());
      setAlreadyNotRead(true);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
      /// event listener for created notifications
      const notificationCollection = collection(db, "notifications");
      const notificationQuery = query(
        notificationCollection,
        where("type", "in", ["like", "comment"])
      );
      let isInitialSnapNotifications = true;
  
      const unsubscribeNotification = onSnapshot(
        notificationQuery,
        (snapshot) => {
          if (isInitialSnapNotifications) {
            isInitialSnapNotifications = false;
            return;
          }
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newNotification = {
                ...change.doc.data(),
                notificationId: change.doc.id,
              };
              if (newNotification.recipient === credentials.handle) {
                // console.log("notification added");
                
                dispatch(addLikeNotification(newNotification));
              }
            } else if (change.type === "removed") {
              const notificationToBeRemoved = {
                ...change.doc.data(),
                notificationId: change.doc.id,
              };
  
              if (
                notificationToBeRemoved.recipient === credentials.handle && 
                notificationToBeRemoved.type === "like"
              ) {
              // console.log("notification removed");
                dispatch(deleteNotificationOnUnlike(notificationToBeRemoved));
              }
            }
          });
        }
      );
      return () => unsubscribeNotification();
    }, [dispatch, credentials.handle, notifications]);

  useEffect(() => {
    if (notReadNots.length > 0) {
      setAlreadyNotRead(false);
    }
  }, [notReadNots]);

  const handleLogoutUser = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <>
      <div className=" bg-bgCard">
        <div className="navbar  items-center justify-between     ">
          {/* left section  */}
          <div className="mx-8 ">
            <Link to="/" className=" flex items-center  text-xl leading-none">
              <img
                src={logo}
                className="w-12 mr-2 sm:mr-0 rounded-full"
                alt="logo"
              />
              <h2 className="text-white font-bold tracking-tighter text-2xl leading-none sm:hidden ">
                Ijakinhy
              </h2>
            </Link>
          </div>
          {/* center section  */}

          <div className="w-[39rem] relative flex items-center ">
            <input
              className={`border-white rounded-full border-none  pl-10 py-2 focus:outline-none text-[18px] bg-gray-400/20 text-white w-full `}
              placeholder="Search"
              type="text"
            />
            <FaSearch
              className={`absolute  inset-0 inset-x-4 inset-y-3 text-gray-400  `}
              size={18}
            />
          </div>
          {/* right section  */}
          <section className="mr-3">
            <div className="flex items-center  sm:pr-0  justify-center relative   ">
              <button className="w-10 h-10 rounded-full pt-1.5   bg-gray-100/20 border-none  ">
                <Link to="/" className="indicator">
                  <FaHome className="text-xl  hover:text-white text-gray-300 " />
                </Link>
              </button>

              {/* /// chats */}

              <div ref={chatRef}>
                <button
                  className="w-10 h-10 rounded-full  pt-1.5   mr-8 sm:mx-8  ml-8    bg-gray-100/20 border-none"
                  onClick={() => dispatch(setIsChatsOpen(!isChatsOpen))}
                >
                  <div className="indicator">
                    <FaFacebookMessenger className="text-xl  hover:text-white text-gray-300  " />
                    <span className=" rounded-full bg-[#cb112d] text-white  font-afacad font-bold px-1 text-[16px]   indicator-item">
                      1
                    </span>
                  </div>
                </button>

                {isChatsOpen && (
                  <div
                    className={`fixed  -right-[7px]       
          bg-bgCard overflow-y-scroll h-[100vh] rounded-sm  w-[21rem] p-2 shadow-2xl`}
                  >
                    <Chats />
                  </div>
                )}
              </div>
              {/* notification */}
              <div ref={ref}>
                <button
                  className="  w-10 h-10 py-auto mr-4 pt-1.5   rounded-full bg-gray-100/5 border-none "
                  onClick={handleReadNotification}
                >
                  <div className="indicator">
                    <NotIcon />

                    <span className=" rounded-full bg-[#cb112d] text-white  font-afacad font-bold px-1 text-[16px]   indicator-item">
                      {!!notReadNots?.length && notReadNots?.length}
                    </span>
                  </div>
                </button>
                {isOpen && (
                  <div
                    className={`fixed right-0 z-[30]      
          bg-bgCard overflow-y-scroll h-[100vh] rounded-sm  w-[20rem] p-2 shadow-2xl `}
                  >
                    <div className="">
                      {!!notifications.length ? (
                        <Notification />
                      ) : (
                        <h2 className="text-gray-300 text-center font-bold">
                          You have no notifications at the moment.
                        </h2>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className=" items-center" ref={logOutDropdownRef}>
              {/* //  dropdown   */}
              <div
                className=" "
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="relative">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle   avatar"
                  >
                    <div className="w-10 rounded-full">
                      <img alt="profile" src={credentials?.profileImage} />
                    </div>
                  </div>
                  <RiArrowDropDownLine className="text-white absolute bottom-[1px] right-[1px] text-2xl leading-none " />
                </div>
                {/*    */}
                {isDropdownOpen && (
                  <div
                    tabIndex={0}
                    className=" menu-lg  bg-[#252728]   z-[1] absolute top-16 right-0 sm:right-0 md:right-0   min-w-64 p-4 rounded-b-md   shadow-2xl"
                  >
                    <div className="flex  hover:bg-accent pl-2  mb-6 cursor-pointer  py-2 rounded-md">
                      <div className="w-10 avatar ">
                        <div className="">
                          <img
                            src={credentials?.profileImage}
                            className=" object-cover rounded-full"
                            alt="profile image"
                          />
                        </div>
                      </div>

                      <div className="text-left ml-2 ">
                        <Link to={`/user/${credentials.userId}`}>
                          <h3 className="text-gray-200 capitalize text-sm leading-none ">
                            View profile
                          </h3>
                          <p className="text-sky-200/80">
                            {credentials?.handle}
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div className="flex  hover:bg-accent pl-2  mb-6 cursor-pointer  py-2 rounded-md">
                      <div className=" w-10  avatar  rounded-full ">
                        <div>
                          <img
                            src={logoutIcon}
                            className="object-"
                            alt="logout"
                          />
                        </div>
                      </div>
                      <div className="ml-2 my-auto">
                        <button
                          className="text-sky-200/80  cursor-pointer"
                          onClick={handleLogoutUser}
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* notification dropdown  */}
    </>
  );
};

export default Navbar;
