import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import setDefaultToken from "../utils/setDefaultToken";

export const signupUser = createAsyncThunk(
  "/user/signUp",
  async ({ formData, navigate }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/signUp", formData);
      const token = res.data.token;
      setDefaultToken({ token });
      localStorage.setItem("token", token);
      navigate("/");
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

/// sign  in

export const signInUser = createAsyncThunk(
  "user/signIn",
  async ({ formData, navigate }, { rejectWithValue}) => {
    try {
      const res = await axios.post("/api/signIn", formData);
      const token = res.data.token;
      setDefaultToken({ token });
      localStorage.setItem("token", token);
      navigate("/");

      return res.data;
    } catch (error) {
      console.log(error);

      return rejectWithValue(error?.response?.data);
    }
  }
);

///    get authenticated user details

export const getAuthenticatedUser = createAsyncThunk(
  "/user/authData",
  async () => {
    try {
      const userRes = (await axios.get("/api/user")).data;
      const screamRes = (await axios.get("/api/screams")).data;

      // console.log({ userRes, screamRes });

      return {
        user: userRes,
        screams: screamRes,
      };
    } catch (error) {
      console.log(error);
    }
  }
);
export const createPost = createAsyncThunk(
  "/createScream",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/scream", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
    }
  }
);

///  mark notification  read
export const readNotifications = createAsyncThunk(
  "/read/notification",
  async () => {
    const res = await axios.get("/api/markNotificationRead");
    return res.data;
  }
);

////  like the scream

export const likeScream = createAsyncThunk("/scream/like", async (screamId) => {
  try {
    const res = await axios.get(`/api/scream/${screamId}/like`);

    return res.data;
  } catch (error) {
    console.log(error);
  }
});

////  unlike the scream

export const unlikeScream = createAsyncThunk(
  "/scream/unlike",
  async (screamId) => {
    try {
      const res = await axios.get(`/api/scream/${screamId}/unlike`);

      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

//  fetch  one scream  details

export const fetchScreamDetails = createAsyncThunk(
  "/scream",
  async (screamId) => {
    try {
      const res = await axios.get(`/api/scream/${screamId}`);

      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

//   add comment
export const commentOnScream = createAsyncThunk(
  "scream/addComment",
  async ({ screamId, commentText }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/scream/${screamId}/comment`, {
        commentText,
      });

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
    }
  }
);

///  fetch details based on the handle

export const fetchUserDetails = createAsyncThunk(
  "user/details",
  async (handle) => {
    const res = await axios.get(`/api/user/${handle}`);

    return res.data;
  }
);

//  add user details

export const addUserDetails = createAsyncThunk(
  "/user/addUserDetails",
  async (formData) => {
    try {
      const res = await axios.post("/api/user", formData);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);

////  upload profile image

export const changeProfileImage = createAsyncThunk(
  "/user/imageUpload",
  async (file) => {
    try {
      const res = await axios.post(
        "/api/user/image",
        { file },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);
