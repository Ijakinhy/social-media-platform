import React, { useEffect, useState } from "react";
import { FaHome } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logo from "../images/logo.jpg";
import logoutIcon from "../images/logOutIcon.png";
import { readNotifications } from "../redux/userActions";
import NotIcon from "../utils/NotIcon";
import Notification from "./Notification";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [alreadyNotRead, setAlreadyNotRead] = useState(false);
  const { credentials, notifications } = useSelector((state) => state.user);

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
    ////  reset the setAlreadyNotRead when new notifications arrive
    if (notReadNots.length > 0) {
      setAlreadyNotRead(false);
    }
  }, [notReadNots]);

  return (
    <>
      <div className=" bg-bgCard   ">
        <div className="navbar  items-center justify-evenly max-sm:justify-between   ">
          <div className="">
            <Link className=" flex items-center  text-xl leading-none">
              <img
                src={logo}
                className="w-12 mr-2 max-sm:mr-0 rounded-full"
                alt="logo"
              />
              <h2 className="text-white font-bold tracking-tighter text-2xl leading-none max-sm:hidden ">
                Ijakinhy
              </h2>
            </Link>
          </div>
          <div className="flex items-center pr-28 max-sm:pr-0  justify-center relative   ">
            <button className="w-10 h-10 rounded-full pt-1.5   bg-gray-100/20 border-none  ">
              <Link to="/" className="indicator">
                <FaHome className="text-xl  hover:text-white text-gray-300 " />
              </Link>
            </button>

            {/* /// chats */}

            <button className="w-10 h-10 rounded-full  pt-1.5   mr-8 max-sm:mx-8  ml-8    bg-gray-100/20 border-none  ">
              <div className="indicator">
                <FaFacebookMessenger className="text-xl  hover:text-white text-gray-300  " />
                <span className=" rounded-full bg-[#cb112d] text-white  font-afacad font-bold px-1 text-[16px]   indicator-item">
                  1
                </span>
              </div>
            </button>
            {/* notification */}
            <div className="dropdown max-sm:dropdown-end ">
              <button
                className="  w-10 h-10 py-auto mr-4 pt-1.5  b rounded-full bg-gray-100/5 border-none "
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
                <div className="menu dropdown-content bg-bgCard2   z-[10]  w-[18rem] p-2 shadow">
                  {!!notifications.length ? (
                    <Notification />
                  ) : (
                    <h2 className="text-gray-300 text-center font-bold">
                      You've not notification
                    </h2>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className=" items-center">
            {/* //  dropdown  */}
            <div className="dropdown  dropdown-end">
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
              <div
                tabIndex={0}
                className=" menu-lg dropdown-content bg-[#252728]   z-[1] mt-2.5 min-w-64 p-4 rounded-b-md  shadow-2xl"
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
                    <h3 className="text-gray-200 capitalize text-sm leading-none ">
                      View profile
                    </h3>
                    <p className="text-sky-200/80">{credentials?.handle}</p>
                  </div>
                </div>

                <div className="flex  hover:bg-accent pl-2  mb-6 cursor-pointer  py-2 rounded-md">
                  <div className=" w-10  avatar  rounded-full ">
                    <div>
                      <img src={logoutIcon} className="object-" alt="logout" />
                    </div>
                  </div>
                  <div className="ml-2 my-auto">
                    <button className="text-sky-200/80  cursor-pointer">
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
