import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateScream from "../components/CreateScream";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import Scream from "../components/Scream";
import { db } from "../firebase";
import { addNewScream, getAuthenticatedUser } from "../redux/userSlice";
const Home = () => {
  const [triggerScreamSnap, setTriggerScreamSnap] = useState(false);

  const dispatch = useDispatch();
  const {
    loading: { app },
    screams,
  } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAuthenticatedUser());
  }, []);

  /// event listener for created scream
  useEffect(() => {
    let IsInitialSnap = true;
    const screamCollection = collection(db, "screams");
    const screamsColQuery = query(
      screamCollection,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(screamsColQuery, (snapshot) => {
      if (IsInitialSnap) {
        IsInitialSnap = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newScream = { ...change.doc.data(), screamId: change.doc.id };

          dispatch(addNewScream(newScream));
        }
      });
    });
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

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
        <div className="h-full">
          <div className="sticky top-0 z-[1000]">
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
