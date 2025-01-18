import React, { useState } from "react";
import logo from "../images/logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../redux/userActions";

const SignUp = () => {
  // const [formData, setFormData] = useState({
  //   handle: "",
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  //   firstName: "",
  // });
  const navigate = useNavigate();

  const {
    loading: { signup },
  } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const handleSignup = (e) => {
    e.preventDefault();
    const Form = new FormData(e.target);
    const formData = Object.fromEntries(Form.entries());

    dispatch(signupUser({ formData, navigate }));
    // setFormData({ handle: "", email: "", password: "" });
  };

  return (
    <div className="bg-slate-200 min-h-screen pb-9 pt-8">
      <img
        className="max-w-32 rounded-full ml-auto  mr-auto "
        src={logo}
        alt="logo"
      />
      <div className="bg-[#ffffff] mt-10  shadow-2xl rounded-lg ml-auto mr-auto w-[28rem] px-5  py-8  xs:w-96 ">
        <h2 className="text-center pb-4 text-sky-900   text-3xl font-medium capitalize">
          create new account
        </h2>

        <form
          action=""
          className="flex flex-col w-full items-center "
          onSubmit={handleSignup}
        >
          <div className="flex items-center  w-full max-w-md">
            <input
              autoComplete="off"
              type="text"
              name="lastName"
              placeholder="first name "
              className="p-2 border text-sm rounded-md input-bordered my-5 focus:border-none border-gray-400 placeholder:capitalize   mr-3  w-full max-w-md"
            />
            <input
              autoComplete="off"
              name="handle"
              type="text"
              placeholder="last name "
              className="p-2 border text-sm rounded-md input-bordered my-5 focus:border-none border-gray-400 placeholder:capitalize   w-full max-w-md"
            />
          </div>

          <input
            autoComplete="off"
            type="tel"
            name="telephoneNumber"
            placeholder="telephone number"
            pattern="^\+?[1-9]\d{1,14}$"
            className="p-2 border text-sm rounded-md input-bordered my-5 focus:border-none border-gray-400 placeholder:capitalize   w-full max-w-md"
          />
          <input
            autoComplete="off"
            name="email"
            type="email"
            placeholder="Email"
            className="p-2 border text-sm rounded-md input-bordered my-5 focus:border-none border-gray-400 placeholder:capitalize   w-full max-w-md"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            className="p-2 border text-sm rounded-md input-bordered my-2 focus:border-none border-gray-400 placeholder:capitalize   w-full max-w-md"
          />
          <button
            type="submit"
            className="p-1 rounded-md hover:bg-sky-800  bg-sky-900 w-full  text-white mt-8   text-lg font-medium"
          >
            {signup ? (
              <span className="loading loading-spinner loading-md" />
            ) : (
              "Sign up"
            )}
          </button>
        </form>
        <div className="flex justify-center mt-4">
          <Link to="/login" className="text-sky-950 hover:underline text-sm">
            Already have an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
