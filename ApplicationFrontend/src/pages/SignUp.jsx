import React, { useRef, useState } from "react";
import logo from "../images/logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../redux/userActions";
import { PiInfoFill } from "react-icons/pi";

const SignUp = () => {
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const lastNameInput = useRef(null);

  const { loading, errors } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const handleSignup = (e) => {
    e.preventDefault();
    const Form = new FormData(e.target);
    const formData = Object.fromEntries(Form.entries());

    dispatch(signupUser({ formData, navigate }));
    // setFormData({ handle: "", email: "", password: "" });
  };
  const handleFocus = (e) => setIsFocused(true);
  const handleBlur = (e) => setIsFocused(false);

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
          <div className="flex   w-full max-w-md">
            <div className="relative flex-grow mr-2 ">
              <input
                ref={lastNameInput}
                autoComplete="off"
                type="text"
                name="lastName"
                placeholder="first name"
                // required
                className={`p-2 border text-sm rounded-md input-bordered my-5  ${
                  errors?.signup?.lastName && "border-red-500"
                } focus:border-none border-gray-400 placeholder:capitalize    w-full max-w-md`}
                onBlur={handleBlur}
                onFocus={handleFocus}
              />
              {!!errors?.signup?.lastName && !isFocused && (
                <PiInfoFill className="text-red-700 absolute inset-6 inset-x-[86%] inset-y-[35%]   text-[24px]" />
              )}
            </div>
            <div className="relative flex-grow mr-2 ">
              <input
                ref={lastNameInput}
                autoComplete="off"
                type="text"
                name="handle"
                placeholder="last name"
                // required
                className={`p-2 border text-sm rounded-md input-bordered my-5  ${
                  errors?.signup?.handle && "border-red-500"
                } focus:border-none border-gray-400 placeholder:capitalize    w-full max-w-md`}
                onBlur={handleBlur}
                onFocus={handleFocus}
              />
              {!!errors?.signup?.handle && !isFocused && (
                <PiInfoFill className="text-red-700 absolute inset-6 inset-x-[86%] inset-y-[35%]   text-[24px]" />
              )}
            </div>
          </div>

          <div className=" flex-1 w-full relative">
            <input
              autoComplete="off"
              type="tel"
              name="telephoneNumber"
              placeholder="+250784554222"
              pattern="^\+?[1-9]\d{1,14}$"
              className={`p-2 border text-sm rounded-md input-bordered my-5  ${
                errors?.signup?.telephoneNumber && "border-red-500"
              } focus:border-none border-gray-400 placeholder:capitalize    w-full max-w-md`}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {!!errors?.signup?.telephoneNumber && !isFocused && (
              <PiInfoFill className="text-red-700 absolute inset-6 inset-x-[93%] inset-y-[35%]   text-[24px]" />
            )}
          </div>
          <div className=" flex-1 w-full relative">
            <input
              autoComplete="off"
              type="email"
              name="email"
              placeholder="email"
              className={`p-2 border text-sm rounded-md input-bordered my-5  ${
                errors?.signup?.email && "border-red-500"
              } focus:border-none border-gray-400 placeholder:capitalize    w-full max-w-md`}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {!!errors?.signup?.email && !isFocused && (
              <PiInfoFill className="text-red-700 absolute inset-6 inset-x-[93%] inset-y-[35%]   text-[24px]" />
            )}
          </div>

          <div className=" flex-1 w-full relative">
            <input
              autoComplete="off"
              type="password"
              name="password"
              placeholder="password"
              className={`p-2 border text-sm rounded-md input-bordered my-5  ${
                errors?.signup?.password && "border-red-500"
              } focus:border-none border-gray-400 placeholder:capitalize    w-full max-w-md`}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
            {!!errors?.signup?.password && !isFocused && (
              <PiInfoFill className="text-red-700 absolute inset-6 inset-x-[93%] inset-y-[35%]   text-[24px]" />
            )}
          </div>
          {errors?.signup?.general && (
            <p className="text-left text-red-600 ml-2 text-[16px]">
              {errors?.signup?.general}
            </p>
          )}

          <button
            type="submit"
            className="p-1 rounded-md hover:bg-sky-800  bg-sky-900 w-full  text-white mt-8   text-lg font-medium"
          >
            {loading.signup ? (
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
