import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { AiFillLike, AiOutlineComment, AiOutlineLike } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import {
  fetchScreamDetails,
  likeScream,
  unlikeScream,
} from "../redux/userActions";
import {
  updateCommentCount,
  updateLikeCount,
  updateProfileImage,
} from "../redux/userSlice";
import AddComment from "./AddComment";

const Scream = ({ scream }) => {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);

  const { likes, credentials } = useSelector((state) => state.user);
  const {
    userHandle,
    createdAt,
    description,
    likeCount,
    screamImage,
    profileImage,
    commentCount,
    screamId,
    postedBy,
  } = scream;
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
  const isScreamAlreadyLiked = likes.some(
    (like) =>
      like?.screamId === screamId && like?.userHandle === credentials.userId
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

  useEffect(() => {
    /// event listener for created notifications
    const notificationCollection = collection(db, "notifications");
    const notificationQuery = query(
      notificationCollection,
      where("type", "in", ["like", "comment"])
    );
    // subscribe to  scream collection
    let screamCountLikeAndCountStarts = true;
    const unsubscribeScream = onSnapshot(
      doc(db, "screams", screamId),
      (snapshot) => {
        if (screamCountLikeAndCountStarts) {
          screamCountLikeAndCountStarts = false;
          return;
        }

        if (snapshot.exists()) {
          const updatedScream = {
            ...snapshot.data(),
            screamId: snapshot.id,
          };
          if (updatedScream.commentCount !== commentCount) {
            dispatch(updateCommentCount(updatedScream));
          }

          if (updatedScream.likeCount !== likeCount) {
            dispatch(updateLikeCount(updatedScream));
          }

          if (updatedScream.profileImage !== profileImage) {
            dispatch(updateProfileImage(updatedScream));
          }
        }
      }
    );

    return () => {
      unsubscribeScream();
    };
  }, [dispatch, likeCount]);
  // let searchParams
  // useEffect(()=> {
  //   searchParams = new URLSearchParams(window.location.search);
  // }, [])
    const [searchParams] = useSearchParams();
  const searchScream = searchParams.get("scream");
const initialRender = useRef(true);

useEffect(() => {
  if (initialRender.current) {
    initialRender.current = false;
    return;
  }

  if (searchScream === screamId) {
    setOpenModal(true);
    dispatch(fetchScreamDetails(searchScream));
  }
}, [searchScream]);


  const handleOPenModal = () => {
    setOpenModal(true);

    dispatch(fetchScreamDetails(screamId));
  };

  return (
    <>
      <div className="flex flex-col relative bg-bgCard my-4 rounded-md xs:w-full xs:mx-auto sm:w-[29rem] w-[39rem] shadow-2xl">
        {/* /// card  header */}
        <div className="pl-3  flex items-center justify-between py-2">
          <div className="flex items-center">
            <Link to={`/${userHandle}`}>
              <img
                className="w-12 h-12 rounded-full object-cover mr-3.5"
                src={profileImage}
                alt="Profile"
              />
            </Link>
            <div className="">
              <Link to={`/${userHandle}`}>
                <h3 className="text-lg leading-3 text-white tracking-tight font-medium">
                  {postedBy}
                </h3>
              </Link>
              <span className="text-[13px] text-gray-500 tracking-normal font-bold ">
                {dayjs(createdAt).fromNow(true)}
              </span>
            </div>
          </div>
          <button className=" p-[4px] hover:bg-accent mr-4 rounded-full  border-none">
            <BiDotsHorizontalRounded className="text-[25px] text-gray-400  hover:text-white" />
          </button>
        </div>
        <p
          className={`text-white pb-1.5 ${
            screamImage
              ? "  text-left text-[15px] leading-normal max-w-[39rem] mx-4 tracking-normal  "
              : " bg-gradient-to-br from-pink-500 via-purple-600 to-blue-500 leading-normal tracking-normal  max-w-[41rem]  h-[24rem]  flex items-center justify-center text-[20px]  px-10 "
          }`}
        >
          {description}
        </p>

        {/* {/* card image */}
        {screamImage && (
          <figure className="">
            <img
              src={screamImage}
              onClick={handleOPenModal}
              className="w-[100%]  object-cover  cursor-pointer"
              alt="posted scream image"
            />
          </figure>
        )}

        {/* card footer */}
        <div className="m-2">
          {/* Add comment  */}

          <div className="flex justify-end">
            <button
              className=" text-gray-300/90 text-right text-sm py-[0.4px] hover:underline hover:cursor-pointer tracking-tight "
              onClick={handleOPenModal}
            >
              {commentCount} comment
            </button>
          </div>

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
            <button
              className=" w-[48%] h-1 mr-2 ml-2  py-[14px]   justify-center hover:bg-accent rounded-md  flex items-center  text-gray-400  text-[1.125rem]"
              onClick={handleOPenModal}
            >
              {commentCount}
              <AiOutlineComment className="ml-2 text-gray-300 text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Add comment Modal  */}

      {openModal && (
        <dialog className="modal modal-open ">
          <AddComment
            screamId={screamId}
            scream={scream}
            openModal={openModal}
            setOpenModal={setOpenModal}
          />
        </dialog>
      )}
    </>
  );
};

export default React.memo(Scream);
