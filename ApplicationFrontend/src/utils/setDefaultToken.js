import { jwtDecode } from "jwt-decode";
import axios from "axios";

const setDefaultToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
      } else {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      localStorage.removeItem("token");
      console.log("Token expired");
    }
  }
};

export default setDefaultToken;
