import React, { useRef, useState } from "react";
import { IoSchoolSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import phoneIcon from "../images/phoneIcon.png";
import emailIcon from "../images/emailIcon.png";
import { Link } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { addUserDetails, changeProfileImage } from "../redux/userActions";
import { FaCamera } from "react-icons/fa";
const Profile = ({ credentials, page }) => {
  const [openModal, setOpenModal] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const handleAddDetails = (e) => {
    e.preventDefault();
    const Form = new FormData(e.target);
    const formData = Object.fromEntries(Form.entries());
    dispatch(addUserDetails(formData));
    setOpenModal(!openModal);
    e.target.reset();
  };

  const handleUploadProfileImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    dispatch(changeProfileImage(file));
  };

  return (
    <>
      <div
        className={`bg-bgCard w-[24rem] mt-4 ${
          page === "userProfilePage" ? "xs:w-full" : "xs:hidden"
        }    sm:w-[20rem]  sm:mx-2  mr-8 h-full`}
      >
        {page === "home" ? (
          <Link to={`/user/${credentials?.userId}`}>
            <div className="w-full relative glass h-24">
              <img
                className="absolute left-1/2 top-20 w-28 h-28 rounded-full transform -translate-x-1/2 -translate-y-1/2 object-cover"
                src={credentials?.profileImage}
                alt="Profile"
              />
            </div>
          </Link>
        ) : (
          <div className="w-full relative glass h-24">
            <div className="relative">
              <img
                className="absolute left-1/2 top-20 w-28 h-28 rounded-full transform -translate-x-1/2 -translate-y-1/2 object-cover"
                src={credentials?.profileImage}
                alt="Profile"
              />
              <input
                type="file"
                id="edit-profileImage"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUploadProfileImage}
              />

              <label
                htmlFor="edit-profileImage"
                className={`cursor-pointer bg-gray-600/80 rounded-full w-8 h-8 flex items-center justify-center absolute inset-0  inset-x-[57%] inset-y-24 ${
                  page === "userProfilePage" ? "block" : "hidden"
                }`}
              >
                <FaCamera className="text-gray-100 text-lg font-bold " />
              </label>
            </div>
          </div>
        )}

        <div className=" mt-11 p-2 ">
          {page === "home" ? (
            <Link to={`/user/${credentials?.userId}`}>
              <h2 className="text-center  mr-auto ml-auto hover:underline cursor-pointer text-gray-300 font-medium tracking-wider capitalize">
                {`${credentials.handle}`}
              </h2>
            </Link>
          ) : (
            <h2 className="text-center  mr-auto ml-auto cursor-pointer text-gray-300 font-medium tracking-wider capitalize">
              {credentials.handle}
            </h2>
          )}

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
            <p className="flex mt-7 text-gray-200 text-left  tracking-side leading-[1]">
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
              {credentials?.telephoneNumber}
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

        {page === "userProfilePage" && (
          <div className="mx-5 my-7">
            <button
              onClick={() => setOpenModal((prev) => !prev)}
              className="  w-full py-3 rounded-lg text-gray-200  font-bold hover:bg-sky-800 bg-sky-900  glass border-none"
            >
              Edit Details
            </button>
          </div>
        )}
      </div>

      {openModal && (
        <dialog className="modal modal-open">
          <div className="modal-box px-0 rounded-md border border-gray-300/10 bg-bgCard">
            <div className=" flex items-center px-5  border- justify-between">
              <h2 className="text-2xl font-afacad  font-semibold text-gray-200 ml-auto mr-auto ">
                Add Profile Details
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="modal-close  bg-gray-500/30 py-1 px-1 rounded-full  text-gray-200 "
              >
                <IoMdClose className="text-[25px]" />
              </button>
            </div>
            <div className=" w-[100%] h-[0.1px] mt-4 bg-gray-400/10" />

            <div className="px-5">
              <form
                action=""
                className="flex flex-col mt-6  "
                onSubmit={handleAddDetails}
              >
                <input
                  autoComplete="value"
                  type="text"
                  placeholder="bio"
                  name="bio"
                  className={`p-4 bg-accent  border-gray-500 text-sm rounded-full  input-bordered     focus:outline-none focus:rounded-md text-white font-bold placeholder:capitalize  w-full `}
                />

                <input
                  name="location"
                  autoComplete="value"
                  type="text"
                  placeholder="location"
                  className={`p-4 bg-accent  border-gray-500 text-sm rounded-full  mt-5 input-bordered   focus:outline-none focus:rounded-md text-white font-bold placeholder:capitalize   w-full`}
                />

                <input
                  autoComplete="value"
                  type="text"
                  name="school"
                  placeholder="school"
                  className={`p-4 bg-accent  border-gray-500 text-sm rounded-full  mt-5 input-bordered   focus:outline-none focus:rounded-md text-white font-bold placeholder:capitalize   w-full`}
                />

                {/* <input
                  autoComplete="value"
                  type="text"
                  placeholder="instagram"
                  className={`p-4 bg-accent  border-gray-500 text-sm rounded-full  mt-5 input-bordered   focus:outline-none focus:rounded-md text-gray-100     w-full`}
                /> */}

                <button
                  type="submit"
                  className="p-1 rounded-md hover:bg-sky-900  bg-sky-800 w-full  text-white mt-8   text-lg font-medium"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default Profile;
