import React from "react";
import { IoSchoolSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { useSelector } from "react-redux";
import phoneIcon from "../images/phoneIcon.png";
import emailIcon from "../images/emailIcon.png";
const Profile = () => {
  const {
    loading: { app },
    credentials,
    screams,
  } = useSelector((state) => state.user);
  return (
    <div className="bg-bgCard w-[25%] mt-4 max-sm:hidden max-[746px]:hidden   mr-8 h-full">
      <div className="w-full relative glass h-24">
        <img
          className="absolute left-1/2 top-20 w-28 h-28 rounded-full transform -translate-x-1/2 -translate-y-1/2 object-cover"
          src={credentials?.profileImage}
          alt="Profile"
        />
      </div>

      <div className=" mt-11 p-2 ">
        <h2 className="text-center  mr-auto ml-auto hover:underline cursor-pointer text-gray-300 font-medium tracking-wider capitalize">
          havyarimana jakin israel{" "}
        </h2>
        {credentials?.bio && (
          <p className=" mt-0 text-sm  text-gray-400/75 text-center ml-auto mr-auto ">
            {credentials?.bio}
          </p>
        )}
        {credentials?.school && (
          <p className="flex mt-4 text-gray-100 text-left tracking-wide leading-[1]">
            <IoSchoolSharp className="text-4xl mr-4  text-gray-400/90 " />
            <span className="text-[14px]  ">
              Went to {`${credentials?.school}`}
            </span>
          </p>
        )}
        {credentials?.location && (
          <p className="flex mt-7 text-gray-200 text-left  tracking-wide leading-[1]">
            <FaLocationDot className="text-2xl mr-4 text-gray-400/90   " />
            <span className="text-[14px]  ">
              Lives in{" "}
              <small className="text-[14px] font-bold capitalize">{`${credentials?.location}`}</small>
            </span>
          </p>
        )}
        <h2 className="mt-9 ml-5 font-bold text-[20px] font-afacad  text-gray-200">
          Contact Info
        </h2>
        <div className="flex items-center mt-4">
          <img src={phoneIcon} className="ml-2" alt="phone number icon" />
          <p className="ml-5 text-gray-200 text-left tracking-wide leading-[1]">
            +{credentials?.telephoneNumber}
            <br />
            <small className=" text-gray-400/65  text-xs leading-none ml-1">
              Mobile
            </small>
          </p>
        </div>
        <div className="flex items-center mt-4">
          <img
            src={emailIcon}
            className="ml-2 max-md:ml-1"
            alt="phone number icon"
          />
          <p className="ml-5 text-gray-200 text-left   tracking-wide leading-[1]">
            {credentials?.email}
            <br />
            <small className=" text-gray-400/65 ml-1 text-xs leading-none">
              Email
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
