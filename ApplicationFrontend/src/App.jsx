import { useContext, useEffect, useState } from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { Route, Router, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import { useDispatch, useSelector } from "react-redux";
import { getAuthenticatedUser } from "./redux/userSlice";
import setDefaultToken from "./utils/setDefaultToken";
import PrivateRouter from "./utils/PrivateRouter";
import { jwtDecode } from "jwt-decode";

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.token) {
      navigate("/");
    }
  }, [localStorage.token]);

  return (
    <>
      <h1>hello</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route
          element={
            <PrivateRouter authenticated={!!localStorage.getItem("token")} />
          }
        >
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}
