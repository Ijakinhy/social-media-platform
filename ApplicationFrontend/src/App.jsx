import { useEffect, useState } from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { Route, Router, Routes } from "react-router-dom";
import PrivateRouter from "./utils/PrivateRouter";
import Home from "./pages/Home";
import { useDispatch } from "react-redux";
import { getAuthenticatedUser } from "./redux/userSlice";

export default function App() {
  const dispatch = useDispatch();
  const token = localStorage.token;
  useEffect(() => {
    if (token) {
      dispatch(getAuthenticatedUser());
    }
  }, []);
  // console.log(!!localStorage.token);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route element={<PrivateRouter authenticated={!!localStorage.token} />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}
