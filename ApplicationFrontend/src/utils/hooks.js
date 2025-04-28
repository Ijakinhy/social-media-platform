///  clause model  when click  out side of it

import { useEffect, useRef, useState } from "react";
import { setIsChatsOpen } from "../redux/chatSlice";
import { useDispatch } from "react-redux";

export const useClickOutside = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isMessageModelOpen, setIsMessageModelOpen] = useState(false);

  const ref = useRef(null);
  const logOutDropdownRef = useRef(null);
  const chatRef = useRef(null);
  const dispatch = useDispatch();
  const handleSelectChat = () => {};

  useEffect(() => {
    //  notifications dropdown
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    //  chats dropdown
    const handleChatDropdown = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        dispatch(setIsChatsOpen(false));
      }
    };

    //  logout and profile dropdown
    const handleLogoutClickOutside = (e) => {
      if (
        logOutDropdownRef.current &&
        !logOutDropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleChatDropdown);
    ///  event listeners
    document.addEventListener("mousedown", handleLogoutClickOutside);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleLogoutClickOutside);
      document.removeEventListener("mousedown", handleChatDropdown);
    };
  }, []);
  ///  returning the states
  return {
    isOpen,
    setIsOpen,
    ref,
    logOutDropdownRef,
    isDropdownOpen,
    setIsDropdownOpen,
    chatRef,
  };
};
