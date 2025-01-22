import React, { useEffect, useMemo } from "react";
import Scream from "../components/Scream";
import Profile from "../components/Profile";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../redux/userActions";
import { useParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const UserDetails = () => {
  const { handle } = useParams();
  const dispatch = useDispatch();
  const { userData, loading, credentials } = useSelector((state) => state.user);
  const memoiseUserScreams = useMemo(
    () => userData.screams,
    [userData.screams]
  );
  useEffect(() => {
    dispatch(fetchUserDetails(handle));
  }, [handle]);

  return (
    <>
      {!userData.screams ? (
        <>
          <div className="relative">
            <div className="text-center  translate-y-3/4 ">
              <div className="w-16 h-16 border-8  border-dashed rounded-full animate-spin border-yellow-500  mx-auto"></div>
              <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="h-full">
            <div className=" flex   justify-center z-0">
              {/* /// profile  */}
              <Profile credentials={userData.user} page="user" />
              <div className="">
                {/* ///  scream  Card */}
                {memoiseUserScreams.map((scream) => (
                  <Scream key={scream.screamId} scream={scream} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserDetails;
