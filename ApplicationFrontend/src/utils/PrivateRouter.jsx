import React, { useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const PrivateRouter = React.memo(({ authenticated }) => {
  const token = useMemo(() => localStorage.getItem("token"), []);

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

  return token ? (
    <>
      <div className="sticky top-0 z-[90]">
        <Navbar />
      </div>
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" replace />
  );
});

export default PrivateRouter;
