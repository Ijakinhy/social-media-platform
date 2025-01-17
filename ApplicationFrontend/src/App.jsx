import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PrivateRouter from "./utils/PrivateRouter";
import UserDetails from "./pages/UserDetails";
import Navbar from "./components/Navbar";
import AuthenticatedUser from "./pages/AuthenticatedUser";

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
