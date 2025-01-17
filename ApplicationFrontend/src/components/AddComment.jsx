import React, { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  AiFillLike,
  AiOutlineComment,
  AiOutlineLike,
  AiOutlineSend,
} from "react-icons/ai";

import {
  commentOnScream,
  likeScream,
  unlikeScream,
} from "../redux/userActions";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { updateComments } from "../redux/userSlice";

const AddComment = ({ openModal, setOpenModal }) => {
  const {
    likes,
    credentials,
    scream,
    loading: { onePost },
    comments,
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  dayjs.extend(relativeTime);
  dayjs.extend(updateLocale);
  dayjs.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ",
      s: "a few seconds ",
      ss: "%d sec",
      m: "1 min ",
      mm: "%dmin ",
      h: "1h ",
      hh: "%dh ",
      d: "1d ",
      dd: "%dd ",
      M: "1m ",
      MM: "%dm ",
      y: "1d",
      yy: (value) => {
        const yearsAgo = dayjs().subtract(value, "year");
        return yearsAgo.format("MMMM D, YYYY");
      },
    },
  });
  const {
    userHandle,
    createdAt,
    description,
    likeCount,
    screamImage,
    profileImage,
    commentCount,
    screamId,
  } = scream;
  const isScreamAlreadyLiked = likes.some(
    (like) =>
      like?.screamId === screamId && like?.userHandle === credentials.handle
  );

  const toggleLikeBtn = !!isScreamAlreadyLiked ? (
    <AiFillLike className="ml-2 text-sky-500 text-2xl" />
  ) : (
    <AiOutlineLike className="ml-2 text-gray-300 text-2xl" />
  );

  const handleLikeScream = () => {
    isScreamAlreadyLiked
      ? dispatch(unlikeScream(screamId))
      : dispatch(likeScream(screamId));
  };

  const handleCloseModal = () => {
    setOpenModal(!openModal);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const commentText = formData.get("commentText");
    dispatch(commentOnScream({ screamId, commentText }));
    console.log(comments);

    e.target.reset();
  };

  useEffect(() => {
    let initAddComment = true;
    const commentCol = query(
      collection(db, "comments"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribeCommentCol = onSnapshot(commentCol, (snapshot) => {
      if (initAddComment) {
        initAddComment = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newComment = { ...change.doc.data(), commentId: change.doc.id };
          if (newComment.userHandle !== credentials.handle) {
            dispatch(updateComments(newComment));
          }
        }
      });
    });
    return () => unsubscribeCommentCol();
  }, [dispatch]);

  return (
    <>
      {onePost ? (
        <></>
      ) : (
        <div className="modal-box z-0 bg-bgCard px-0 py-0 max-w-3xl rounded-md h-[100vh] custom-scrollbar">
          <div className=" flex items-center px-5 py-2   justify-between">
            <h2 className="text-xl   font-semibold text-gray-200 ml-auto mr-auto ">
              {userHandle}'s post
            </h2>
            <label
              className="  bg-gray-500/30 py-1 px-1 rounded-full  text-gray-200 "
              onClick={handleCloseModal}
            >
              <IoMdClose className="text-[25px]" />
            </label>
          </div>
          <div className=" w-[100%] h-[0.1px] mt-2 bg-gray-400/30" />
          {/* ///  body */}
          <div className="flex  flex-col">
            {/* top */}
            <div className="pl-3  flex items-center justify-between py-2">
              <div className="flex items-center">
                <img
                  className="w-12 h-12 rounded-full object-cover mr-3.5"
                  src={profileImage}
                  alt="Profile"
                />
                <div className="">
                  <h3 className="text-lg leading-3 text-white tracking-tight font-medium">
                    {userHandle}
                  </h3>
                  <span className="text-[13px] text-gray-500 tracking-normal font-bold ">
                    {dayjs(createdAt).fromNow(true)}
                  </span>
                </div>
              </div>
              <button className=" p-[4px] hover:bg-accent mr-4 rounded-full  border-none">
                <BiDotsHorizontalRounded className="text-[25px] text-gray-400  hover:text-white" />
              </button>
            </div>

            <div>
              <p
                className={`text-white pb-1.5 ${
                  screamImage
                    ? "  text-left text-[15px] leading-normal max-w-[39rem] mx-4 tracking-normal  "
                    : " bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 leading-normal tracking-normal  max-w-full  h-[24rem]  flex items-center justify-center text-[20px]  px-10 "
                }`}
              >
                {description}
              </p>

              {/* {/* card image */}

              {screamImage && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-sm brightness-50"
                    style={{ backgroundImage: `url(${screamImage})` }}
                  ></div>

                  <img
                    src={screamImage}
                    alt="Image"
                    className="relative w-[30rem] h-full object-contain"
                  />
                </div>
              )}

              <div className="m-2">
                <p className="  text-gray-300/90 text-right text-sm py-[0.4px] hover:underline hover:cursor-pointer tracking-tight ">
                  {commentCount} comments
                </p>

                <div className=" w-[100%] h-[0.2px] bg-gray-400/80" />
                <div className="mt-2 flex items-center justify-between  ">
                  {}
                  <button
                    onClick={handleLikeScream}
                    className=" w-[48%] h-1 mr-2 ml-2  py-[14px]  justify-center hover:bg-accent rounded-md  flex items-center  text-gray-400 font-afacad text-[1.125rem]   "
                  >
                    {likeCount}
                    {toggleLikeBtn}
                  </button>
                  <button className=" w-[48%] h-1 mr-2 ml-2  py-[14px]   justify-center hover:bg-accent rounded-md  flex items-center  text-gray-400  text-[1.125rem]">
                    {commentCount}
                    <AiOutlineComment className="ml-2 text-gray-300 text-2xl" />
                  </button>
                </div>
                <div className=" w-[100%] h-[0.2px] bg-gray-400/80" />
              </div>
            </div>
            {/* center  */}
            <div className="flex flex-col m ">
              {comments.map((comment) => (
                <div className="flex  ml-3   " key={comment.commentId}>
                  <div className="w-10 mr-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover mr-3.5"
                      src={comment.profileImage}
                      alt="Profile"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="max-w-[40vw] flex  flex-col bg-gray-400/10 text-gray-100 px-2 py-[1px] rounded-2xl">
                      <strong className="text-sm ml- tracking-wider capitalize">
                        {comment.userHandle}
                      </strong>
                      <p className="text-[15px] font-normal font-afacad">
                        {comment.commentText}
                      </p>
                    </div>
                    <span className="text-[13px] text-gray-500 tracking-normal font-bold ml-2 ">
                      {dayjs(comment.createdAt).fromNow(true)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ///  bottom */}
          </div>
          <div className="flex items-center h-20    bg-bgCard z-[100] shadow-inner   sticky bottom-0 mt-8  ">
            <img
              src={credentials.profileImage}
              className="w-9 rounded-full mx-3"
              alt=""
            />

            <form
              className="flex items-center  flex-grow px-1 py-1 rounded-xl bg-gray-300/5 mr-5 "
              onSubmit={handleSubmitComment}
            >
              <input
                className=" px-2 py-1 flex-1 rounded-md border-none bg-transparent focus:outline-none focus:border-accent
            text-gray-100"
                name="commentText"
                type="text"
                autoComplete="off"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                className="w-12 h-10 ml-2 rounded-md  border-none "
              >
                <AiOutlineSend className="text-white text-2xl" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddComment;

//  <div className="flex  ml-20   ">
//    <div className="w-10 ">
//      <img
//        className="w-7 rounded-full object-cover "
//        src={profileImage}
//        alt="Profile"
//      />
//    </div>
//    <div className="flex flex-col">
//      <div className="max-w-[40vw] flex  flex-col bg-gray-400/10 text-gray-100 px-2 py-[1px] rounded-2xl">
//        <strong className="text-sm ml- tracking-wider capitalize">
//          havyarimana
//        </strong>
//        <p className="text-[15px] font-normal font-afacad">
//          this is the comment Lorem
//        </p>
//      </div>
//      <span className="text-[13px] text-gray-500 tracking-normal font-bold ml-2 ">
//        {dayjs(createdAt).fromNow(true)}
//      </span>
//    </div>
//  </div>;
