import { Route, Routes } from "react-router-dom";
import AuthenticatedUser from "./pages/AuthenticatedUser";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserDetails from "./pages/UserDetails";
import PrivateRouter from "./utils/PrivateRouter";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route
          element={
            <PrivateRouter authenticated={!!localStorage.getItem("token")} />
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/:handle" element={<UserDetails />} />
          <Route path="/user/:handle" element={<AuthenticatedUser />} />
        </Route>
      </Routes>
    </>
  );
}
