import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuthenticatedUser } from "../redux/userSlice";
import Navbar from "../components/Navbar";

const Home = () => {
  const dispatch = useDispatch();
  const {
    loading: { app },
  } = useSelector((state) => state.user);

  const navigate = useNavigate();
  console.log("component mounted");

  useEffect(() => {
    dispatch(getAuthenticatedUser());
    console.log(localStorage.token);
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
          <Navbar />
        </div>
      )}
    </>
  );
};

export default Home;
