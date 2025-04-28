import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { useSelector } from "react-redux";
import { AiFillLike, AiOutlineComment } from "react-icons/ai";
import { Link } from "react-router-dom";
const Notification = () => {
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
  const { credentials, notifications } = useSelector((state) => state.user);

  return (
    <>
      {notifications.map((notification) => {
        const {
          sender,
          createdAt,
          type,
          profileImage,
          screamId,
          read,
          notificationId,
        } = notification;

        return (
          <Link
            to={`/${screamId}`}
            key={notificationId}
            className={`flex  hover:bg-accent/5  pl-2  mb-6 cursor-pointer  py-2 rounded-md  ${
              !read && "bg-gray-100/15"
            }`}
          >
            <div className="  relative ">
              <div className="">
                <img
                  src={profileImage}
                  className=" w-[4rem] h-[4rem] object-cover rounded-full"
                  alt="profile image"
                />
              </div>
              <div className="bg-sky-800 px-2 py-2 rounded-full absolute bottom-[-3px] right-[-6px]  text-xl leading-none ">
                {type === "like" ? (
                  <AiFillLike className="text-white  " />
                ) : (
                  <AiOutlineComment className="text-white " />
                )}
              </div>
            </div>

            <div className="text-left ml-2 pt-1 flex flex-col ">
              <span className="text-gray-300 font-afacad  text-[1.10rem] leading-none ">
                <strong className="capitalize">{sender}</strong> {type}s your
                post
              </span>
              <span className="text-[13px] text-sky-700 tracking-normal font-bold ">
                {dayjs(createdAt).fromNow(true)}
              </span>
            </div>
          </Link>
        );
      })}
    </>
  );
};

export default Notification;
