import React, { useEffect, useMemo, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
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
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      </nav>

      <>
        {
          <div
            className={`fixed left-1/2 xs:left-auto ${
              openNotificationModel ? "block" : "hidden"
            }   xs:right-5  z-[30]  transform translate-x-[10%]  -translate-y-1    
          bg-bgCard overflow-y-scroll h-[40rem] rounded-sm  w-[18rem] p-2 shadow-2xl `}
          >
            <div className="">
              {!!notifications.length ? (
                <Notification />
              ) : (
                <h2 className="text-gray-300 text-center font-bold">
                  You have no notifications at the moment.
                </h2>
              )}
            </div>
          </div>
        }
      </>
      <main>
        <Outlet />
      </main>
    </>
  ) : (
    <Navigate to="/login" replace />
  );
});

export default PrivateRouter;
