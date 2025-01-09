import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import cameraIcon from "../images/cameraIcon.png";
import emojiIcon from "../images/emojiIcon.png";
import imageIcon from "../images/imageIcon.png";
import { createPost } from "../redux/userSlice";
const CreateScream = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const {
    loading: { app, post },
    credentials,
    screams,
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const handleChangeImage = (e) => {
    setImage(e.target.files[0]);
  };

  ///  handle add new scream
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", text);
    formData.append("image", image);
    dispatch(createPost(formData));
    setText("");
    setImage(null);
    if (!post) {
      document.getElementById("my-modal").checked = false;
    }
    setTriggerSnapshot(true);
  };

  return (
    <>
      <div className="card  w-[39rem] max-sm:w-[29rem] px-4 pt-2 mt-4 bg-bgCard   h-32 shadow-xl">
        <div className="flex items-center">
          <img
            className="w-12 h-12 rounded-full object-cover mr-3.5"
            src={credentials?.profileImage}
            alt="Profile"
          />
          <div className="w-full  flex">
            <label
              htmlFor="my-modal"
              className="border-white rounded-full border-none px-2 py-3.5 text-sm bg-gray-400/20 text-white w-full flex-grow"
            >
              {`What's in your mind, ${credentials?.handle}`}
            </label>
          </div>
        </div>
        <div className=" w-[100%] h-[0.2px] mt-4 bg-gray-400/80" />

        <div className="flex items-center justify-between">
          <label
            htmlFor="my-modal"
            className="  flex items-center rounded-md font-bold mt-5 pt-1 pb-1   text-center hover:bg-gray-400/20 text-gray-400 justify-center w-2/6 ml-auto mr-auto"
          >
            <img src={cameraIcon} alt="" className="mr-2" />
            video
          </label>
          <label
            htmlFor="my-modal"
            className="  flex items-center rounded-md font-bold mt-5 pt-1 pb-1   text-center hover:bg-gray-400/20 text-gray-400 justify-center w-2/6 ml-auto mr-auto"
          >
            <img src={imageIcon} alt="" className="mr-2" />
            Photo
          </label>
          <label
            htmlFor="my-modal"
            className="  flex items-center rounded-md font-bold mt-5 pt-1 pb-1   text-center hover:bg-gray-400/20 text-gray-400 justify-center w-2/6 ml-auto mr-auto"
          >
            <img src={emojiIcon} alt="" className="mr-2" />
            Feeling/activity
          </label>
        </div>
      </div>
      {/* //  modal  */}
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box px-0 rounded-md border border-gray-300/10 bg-bgCard">
          <div className=" flex items-center px-5  border- justify-between">
            <h2 className="text-2xl font-afacad  font-semibold text-gray-200 ml-auto mr-auto ">
              Create Post
            </h2>
            <label
              htmlFor="my-modal"
              className="modal-close  bg-gray-500/30 py-1 px-1 rounded-full  text-gray-200 "
            >
              <IoMdClose className="text-[25px]" />
            </label>
          </div>
          <div className=" w-[100%] h-[0.1px] mt-4 bg-gray-400/10" />
          <div className="px-5 my-4 flex items-center ">
            <img
              className="w-10 h-10 rounded-full object-cover mr-3.5"
              src={credentials?.profileImage}
              alt="Profile"
            />
            <h1 className="text-gray-200 leading-none font-medium capitalize ">
              jakin israel
            </h1>
          </div>
          <div className="px-5">
            <form action="" onSubmit={handleSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="px-3 py-2 h-32 w-full text-gray-200  bg-transparent rounded-md focus:outline-none placeholder:text-[28px]"
                placeholder={`What's on your mind, ${credentials?.handle}?`}
              />
              <label htmlFor="uploadImage">
                <input
                  type="file"
                  id="uploadImage"
                  className="hidden"
                  onChange={handleChangeImage}
                  // accept="image/*"
                />
                <div className="flex items-center justify-center w-full h-12 border border-gray-300/20 rounded-md text-sm hover:bg-gray-400/20 text-gray-400">
                  <img src={imageIcon} alt="" className="mr-4" />
                  Add to your post
                </div>
              </label>
              <button
                disabled={!text && image === null}
                type="submit"
                className="disabled:bg-gray-400/20 bg-sky-800 text-gray-200 w-full  mt-4 py-2 rounded-md"
              >
                {post ? <span className="loading loading-spinner" /> : "Post"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateScream;
