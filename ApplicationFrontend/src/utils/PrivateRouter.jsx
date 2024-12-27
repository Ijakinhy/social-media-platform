import { jwtDecode } from "jwt-decode";
import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

const PrivateRouter = ({ authenticated }) => {
  const token = localStorage.token;
  const navigate = useNavigate();
  if (token) {
    const decodedToken = jwtDecode(token);

    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
  return !authenticated ? <Navigate to="/login" /> : <Outlet />;
};

export default PrivateRouter;
