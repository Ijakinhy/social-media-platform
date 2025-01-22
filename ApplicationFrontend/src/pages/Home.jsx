import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CreateScream from "../components/CreateScream";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import Scream from "../components/Scream";
import { db } from "../firebase";
import { getAuthenticatedUser } from "../redux/userActions";
import { addNewScream } from "../redux/userSlice";
import Notification from "../components/Notification";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Home = () => {
  const dispatch = useDispatch();
  const app = useSelector((state) => state.user.loading.app);
  const screams = useSelector((state) => state.user.screams);
  const credentials = useSelector((state) => state.user.credentials);
  const notifications = useSelector((state) => state.user.notifications);

  const memoiseScreams = useMemo(() => screams, [screams]);

  // / event listener for created scream
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    dispatch(getAuthenticatedUser());
  }, [dispatch]);
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
          <div className=" relative flex sm:justify-evenly justify-center  ">
            {/* /// profile  */}
            <Profile credentials={credentials} page={"home"} />
            <div className="">
              {/* ///  create card  post  */}
              <CreateScream />
              {/* ///  scream  Card */}
              {memoiseScreams.map((scream) => (
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
