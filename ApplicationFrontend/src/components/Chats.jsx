import React, { useRef, useState } from "react";
import { useClickOutside } from "../utils/hooks";
import jakinImg from "../images/jakin.jpg";
import { FaSearch } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { AiOutlineSend } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setIsMessageModelOpen, setIsChatsOpen } from "../redux/chatSlice";
const Chats = () => {
  const { isMessageModelOpen } = useSelector((state) => state.chats);
  const dispatch = useDispatch();

  const handleSelectChat = () => {
    dispatch(setIsMessageModelOpen(true));
    dispatch(setIsChatsOpen(false));
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-100 ml-12 mb-3 ">Chats</h1>
        <div className="flex-row relative flex items-center mb-9  ">
          <input
            className={`border-white rounded-full border-none  pl-10 py-1 focus:outline-none text-[18px] bg-gray-400/20 text-white w-full `}
            placeholder="Search"
            type="text"
          />
          <FaSearch
            className={`absolute  inset-0 inset-x-4 inset-y-2 text-gray-400  `}
            size={16}
          />
        </div>
        {/* Chats */}
        <div
          className={`  flex mt-2  relative group/parent bg-[#0c1317] transition-all ease-out p-1.5 rounded-lg justify-between items-center    `}
          onClick={handleSelectChat}
        >
          <div className="flex items-center  ">
            <div className="w-16 rounded-full">
              <img
                src={jakinImg}
                alt="recipient profile"
                className="w-full rounded-full"
              />
            </div>
            <div className="flex  flex-col ml-3">
              <h5 className="text-gray-100 font-normal  capitalize m">
                john Doe
              </h5>
              <p className="text-gray-300 text-sm -serif">
                You: <span>hey</span> . 1w
              </p>
            </div>
          </div>
          <span className="text-slate-900  absolute top-1 right-2  px-1 py-0.5 font-bold rounded-full font-afacad  bg-[#00A884]">
            20
          </span>
          <FaChevronDown className="text-gray-200 text-sm absolute bottom-1 cursor-pointer right-2  rounded-full opacity-0 group-hover/parent:opacity-100  transition-all pointer-events-none group-hover/parent:pointer-events-auto " />
        </div>
      </div>
    </>
  );
};

export default Chats;
