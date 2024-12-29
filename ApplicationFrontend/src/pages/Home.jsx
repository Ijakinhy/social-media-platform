import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuthenticatedUser } from "../redux/userSlice";
import Navbar from "../components/Navbar";

const Home = () => {
  const dispatch = useDispatch();
  const {
    userData: { token },
  } = useSelector((state) => state.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.token) {
      dispatch(getAuthenticatedUser());
      navigate("/");
    }
  }, [localStorage.token]);
  return (
    <div className="bg-neutral-900 h-svh">
      <Navbar />
    </div>
  );
};

export default Home;
