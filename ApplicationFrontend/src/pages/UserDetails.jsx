import React, { useEffect, useMemo } from "react";
import Scream from "../components/Scream";
import Profile from "../components/Profile";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../redux/userActions";
import { useParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { addNewScream } from "../redux/userSlice";
import CreateScream from "../components/CreateScream";

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
  useEffect(() => {
    let IsInitialSnap = true;

    const screamCollection = collection(db, "screams");
    const screamsColQuery = query(
      screamCollection,
      orderBy("createdAt", "desc")
    );

    const unsubscribeScream = onSnapshot(screamsColQuery, (snapshot) => {
      if (IsInitialSnap) {
        IsInitialSnap = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        // const currentData = change.doc.data();
        if (change.type === "added") {
          const newScream = { ...change.doc.data(), screamId: change.doc.id };
          if (newScream.userHandle !== credentials.handle) {
            dispatch(addNewScream(newScream));
          }
        }
      });
    });

    return () => {
      unsubscribeScream();
    };
  }, [dispatch]);

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
             {userData.user && userData.user.handle === credentials.handle &&(
              <CreateScream />
            )}

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
