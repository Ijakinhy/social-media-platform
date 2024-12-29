import React, { useState } from "react";
import logo from "../images/logo.jpg";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../redux/userSlice";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    handle: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const {
    loading: { signup },
  } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const handleSignup = (e) => {
    console.log(formData);
    e.preventDefault();
    dispatch(signupUser({ formData, navigate }));
    setFormData({ handle: "", email: "", password: "" });
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-9 pt-8">
      <img
        className="max-w-32 rounded-full ml-auto  mr-auto "
        src={logo}
        alt="logo"
      />
      <div className="bg-white mt-10  shadow-2xl rounded-lg ml-auto mr-auto w-96 p-8 ">
        <h2 className="text-center pb-4 text-sky-900   text-3xl font-medium capitalize">
          create new account
        </h2>

        <form
          action=""
          className="flex flex-col  items-center mt-auto mb-auto"
          onSubmit={handleSignup}
        >
          <input
            type="text"
            placeholder="Username"
            value={formData.handle}
            onChange={(e) =>
              setFormData({ ...formData, handle: e.target.value })
            }
            className="p-2 border text-sm rounded-md input-bordered my-5 focus:border-none  w-full max-w-xs"
          />
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
            className="p-2 border text-sm rounded-md input-bordered my-2 focus:border-none  w-full max-w-xs"
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
