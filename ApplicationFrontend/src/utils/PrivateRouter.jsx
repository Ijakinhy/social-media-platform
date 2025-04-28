import React, { useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Notification from "../components/Notification";
import { useDispatch, useSelector } from "react-redux";
import { getAuthenticatedUser } from "../redux/userActions";

const PrivateRouter = React.memo(({ authenticated }) => {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const { notifications, openNotificationModel } = useSelector(
    (state) => state.user
  );
  const isTokenValid = useMemo(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp * 1000 < Date.now();
    }
    return true;
  }, [token]);

  if (isTokenValid) {
    console.log("token expired");

    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    return <Navigate to="/login" />;
  }
  const dispatch = useDispatch();
  useEffect(() => {
    if (localStorage.token) {
      const decodedToken = jwtDecode(localStorage.token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        console.log("Token expired");
      } else {
        dispatch(getAuthenticatedUser());
      }
    }
  }, [localStorage.token]);

  return token ? (
    <>
      <nav className="sticky top-0 z-20 ">
        <Navbar />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  ) : (
    <Navigate to="/login" replace />
  );
});

export default PrivateRouter;
