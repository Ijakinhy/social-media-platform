import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CreateScream from "../components/CreateScream";
import Navbar from "../components/Navbar";
import Scream from "../components/Scream";
import { getAuthenticatedUser } from "../redux/userSlice";
import Profile from "../components/Profile";
const Home = () => {
  const dispatch = useDispatch();
  const {
    loading: { app },
    userData: { credentials },
    screams,
  } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAuthenticatedUser());
  }, []);

  return (
    <>
      {app ? (
        <div className="relative">
          <div className="text-center  translate-y-3/4 ">
            <div className="w-16 h-16 border-8  border-dashed rounded-full animate-spin border-yellow-500  mx-auto"></div>
            <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Your adventure is about to begin
            </p>
          </div>
        </div>
      ) : (
        <div className="h-svh">
          <div className="sticky top-0 z-50">
            <Navbar />
          </div>

          <div className=" flex   justify-center z-0">
            {/* /// profile  */}
            <Profile />
            <div className="">
              {/* ///  create card  post  */}
              <CreateScream />
              {/* ///  scream  Card */}
              {screams.map((scream) => (
                <Scream key={scream.screamId} scream={scream} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
