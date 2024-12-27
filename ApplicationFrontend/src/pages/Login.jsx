import React, { useState } from "react";
import logo from "../images/logo.jpg";
import { PiInfoFill } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInUser } from "../redux/userSlice";
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();

  const handleSignIn = (e) => {
    e.preventDefault();
    dispatch(signInUser(formData));
  };

  return (
    <div className="">
      <img
        className="max-w-28 rounded-full ml-auto  mr-auto mt-8"
        src={logo}
        alt="logo"
      />
      <div className="h-11 flex ml-auto mr-auto mt-8 mb-8 max-w-xl   bg-white border border-sky-800 ">
        <div className="w-12  flex justify-center items-center  h-full bg-sky-800">
          <PiInfoFill className="text-white   text-2xl" />
        </div>
        <p className="text-black mt-2 ml-2 font-roboto">
          {" "}
          You must log in to continue.{" "}
        </p>
      </div>

      <div className=" bg-white mt-1 text-xl  tracking-wider  shadow-2xl rounded-lg ml-auto mr-auto  max-w-sm p-8 ">
        <h4 className="text-center font-roboto  pb-4 text-slate-900    text-md font-normal capitalize">
          Log into Ijakinhy
        </h4>

        <form
          action=""
          onSubmit={handleSignIn}
          className="flex flex-col  items-center mt-auto mb-auto  "
        >
          <div className="bg-bgSupport border border-borderSupport w-full h-10">
            <p className=" text-sm mt-2 text-center font-roboto text-black">
              You must log in to continue
            </p>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="p-2 border text-sm rounded-md input-bordered my-5 focus:border-none  w-full max-w-xs"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="p-2 border text-sm rounded-md input-bordered focus:border-none   w-full max-w-xs"
          />
          <button
            type="submit"
            className="p-1 rounded-md hover:bg-sky-900  bg-sky-800 w-full  text-white mt-8   text-lg font-medium"
          >
            Sign in
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <Link to="/signUp" className="text-sky-950 hover:underline text-sm">
            I don't have account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
