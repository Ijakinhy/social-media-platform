import axios from "axios";
import { jwtDecode } from "jwt-decode";

const setDefaultToken = ({ token }) => {
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        console.log("Token expired");
      } else {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      console.log("Token expired");
    }
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setDefaultToken;
