import React, { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { AiOutlineComment, AiOutlineLike, AiFillLike } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  addLikeNotification,
  deleteNotificationOnUnlike,
  likeScream,
  unlikeScream,
  updateLikeCount,
} from "../redux/userSlice";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const Scream = ({ scream }) => {
  const dispatch = useDispatch();
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

  useEffect(() => {
    /// event listener for created notifications
    const notificationCollection = collection(db, "notifications");
    let isInitialSnapNotifications = true;

    const unsubscribeNotification = onSnapshot(
      notificationCollection,
      (snapshot) => {
        if (isInitialSnapNotifications) {
          isInitialSnapNotifications = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          const newNotification = {
            ...change.doc.data(),
            notificationId: change.doc.id,
          };
          if (change.type === "added") {
            if (
              newNotification.recipient === credentials.handle &&
              (newNotification.type === "like" ||
                newNotification.type === "comment")
            ) {
              dispatch(addLikeNotification(newNotification));
            }
          } else if (change.type === "removed") {
            const notificationToBeRemoved = {
              ...change.doc.data(),
              notificationId: change.doc.id,
            };
            if (
              notificationToBeRemoved.recipient === credentials.handle &&
              (notificationToBeRemoved.type === "like" ||
                notificationToBeRemoved.type === "comment")
            ) {
              dispatch(deleteNotificationOnUnlike(notificationToBeRemoved));
            }
          }
        });
      }
    );

    // unsubscribe from scream collection
    let screamCountLikeAndCountStarts = true;
    const unsubscribeScream = onSnapshot(
      collection(db, "screams"),
      (snapshot) => {
        if (screamCountLikeAndCountStarts) {
          screamCountLikeAndCountStarts = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const updatedScream = {
              ...change.doc.data(),
              screamId: change.doc.id,
            };
            if (updatedScream.likeCount !== likeCount) {
              dispatch(updateLikeCount(updatedScream));
            }
          }
        });
      }
    );

    return () => {
      unsubscribeNotification();
      unsubscribeScream();
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col relative bg-bgCard my-4 rounded-md max-sm:w-[29rem] w-[39rem]   shadow-2xl">
      {/* /// card  header */}
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
            className="w-[100%]  object-cover "
            alt="posted scream image"
          />
        </figure>
      )}

      {/* card footer */}
      <div className="m-2">
        <p className="text-gray-300/90 text-right text-sm tracking-tight ">
          1 comment
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
            {/* <AiOutlineLike className="ml-2 text-gray-300 text-2xl" /> */}
          </button>
          <button className=" w-[48%] h-1 mr-2 ml-2  py-[14px]  justify-center hover:bg-accent rounded-md  flex items-center  text-gray-400  text-[1.125rem]   ">
            {commentCount}
            <AiOutlineComment className="ml-2 text-gray-300 text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scream;
