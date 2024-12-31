import React from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.jpg";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { MdOutlineLogout } from "react-icons/md";
import logoutIcon from "../images/logOutIcon.png";
import { IoIosNotifications } from "react-icons/io";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const { credentials } = userData;

  return (
    <div className="navbar  border-b  shadow-sm">
      <div className="">
        <Link className="btn btn-ghost text-xl">
          <img src={logo} className="w-12 rounded-full" alt="logo" />
          <h2 className="text-white font-bold tracking-tighter text-2xl">
            Ijakinhy
          </h2>
        </Link>
      </div>
      <div className="flex items-center w-1/3 relative hover:bg-sky-800/10 hover:rounded-full    ">
        <span className="absolute inset-0 left-0  flex items-center pl-3  text-gray-500 pointer-events-none ">
          <FaSearch className="  " />
        </span>
        <input
          type="text"
          className="w-full border-white  pl-10 rounded-full border border-none focus:border-8  px-4 py-2 text-sm bg-sky-400/20 text-white     "
          placeholder="Search"
        />
      </div>

      <div className=" items-center">
        {/* ///  create post  */}
        {/* <button className="btn border-none bg-sky-200/10 mr-4 hover:bg-sky-400/10">
          <FiPlus className="text-white text-xl " />
          <span className="text-white text-base capitalize  font-medium ">
            create
          </span>
        </button> */}

        <button className="w-[100px] bg-sky-200/10 h-[35px]  flex items-center justify-center rounded-xl cursor-pointer relative overflow-hidden transition-all duration-500 ease-in-out shadow-md hover:scale-105 hover:shadow-lg before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-sky-800 before:to-slate-800 before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-xl hover:before:left-0 text-[#fff] mr-5">
          <FiPlus className="text-white text-xl mr-2 " />
          <span className="text-white text-base capitalize  font-medium ">
            create
          </span>
        </button>

        {/* /// chats */}

        <button className="w-10 h-10 rounded-full pt-1.5  hover:bg-accent border-none btn-ghost ">
          <div className="indicator">
            <IoChatbubbleEllipsesOutline className="text-2xl hover:text-white text-gray-300 " />
            {/* <span className=" bg-accent px-1 rounded-full text-white tracking-wider text-sm indicator-item">
              0
            </span> */}
          </div>
        </button>
        {/* notification */}
        <button className=" w-10 h-10 py-auto mr-4 pt-1.5  btn-ghost rounded-full hover:bg-accent border-none ">
          <div className="indicator">
            <IoIosNotifications className="text-2xl hover:text-white text-gray-300 " />
            <span className=" bg-accent px-1 rounded-full text-white tracking-wider text-sm indicator-item">
              0
            </span>
          </div>
        </button>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src={credentials?.profileImage}
              />
            </div>
          </div>
          {/*   */}
          <div
            tabIndex={0}
            className=" menu-lg dropdown-content bg-bgDropDown  z-[1] mt-2.5 min-w-64 p-4 rounded-sm  shadow-2xl"
          >
            <div className="flex  hover:bg-accent pl-2 cursor-pointer  pt-1 rounded-md">
              <div className="w-14 mb-5 ">
                <img
                  src={credentials?.profileImage}
                  className="rounded-full"
                  alt="profile image"
                />
              </div>
              <div className="text-left ml-2 my-auto">
                <h3 className="text-gray-200 capitalize text-sm ">
                  View profile
                </h3>
                <p className="text-sky-200/80">{credentials?.handle}</p>
              </div>
            </div>

            <div className="flex  hover:bg-accent rounded-md p-1">
              <div className=" w-14   rounded-full ">
                <img src={logoutIcon} className="" alt="logout" />
              </div>
              <div className="ml-2 my-auto">
                <span className="text-sky-200/80  cursor-pointer">Log Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
