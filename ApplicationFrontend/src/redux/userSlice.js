import React from "react";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import setDefaultToken from "../utils/setDefaultToken";

const initialState = {
  credentials: {},
  loading: {
    signup: false,
    signin: false,
    app: false,
    post: false,
  },

  screams: [],
  notifications: [],
  messageNotifications: [],
  errors: {},
};

///  signup

export const signupUser = createAsyncThunk(
  "/user/signUp",
  async ({ formData, navigate }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post("/api/signUp", formData);
      const token = res.data.token;
      setDefaultToken({ token });
      localStorage.setItem("token", token);
      navigate("/");
      return res.data;
    } catch (error) {
      console.log(error.message);
      return rejectWithValue(error?.response?.data);
    }
  }
);

/// sign  in

export const signInUser = createAsyncThunk(
  "user/signIn",
  async ({ formData, navigate }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post("/api/signIn", formData);
      const token = res.data.token;
      setDefaultToken({ token });
      localStorage.setItem("token", token);
      navigate("/");

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
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
      console.log(res.data);

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.message);
    }
  }
);

export const readNotifications = createAsyncThunk(
  "/read/notification",
  async () => {
    const res = await axios.get("/api/markNotificationRead");
    return res.data;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading.signup = true;
        state.errors = {};
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading.signup = false;
        state.credentials = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading.signup = false;
        state.errors = action.payload.error;
      })
      // sign in
      .addCase(signInUser.pending, (state) => {
        state.loading.signin = true;
        state.errors = {};
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading.signin = false;
        state.credentials = action.payload;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading.signin = false;
        state.errors = action.payload.error;
      })
      // get authenticated user details
      .addCase(getAuthenticatedUser.pending, (state) => {
        state.loading.app = true;
        state.errors = {};
      })
      .addCase(getAuthenticatedUser.fulfilled, (state, action) => {
        state.loading.app = false;

        state.credentials = action.payload.user.credentials;
        state.notifications = action.payload.user.notifications;
        state.messageNotifications = action.payload.user.messageNotifications;
        state.screams = action.payload.screams;
      })
      .addCase(getAuthenticatedUser.rejected, (state, action) => {
        state.loading.app = false;
        state.errors = action.payload.error;
      })
      // create scream
      .addCase(createPost.pending, (state) => {
        state.loading.post = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading.post = false;
        state.screams.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading.post = false;
        state.errors = action.payload;
      })
      ///  read notification
      .addCase(readNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.map((notification) =>
          !notification.read ? { ...notification, read: true } : notification
        );
      });
  },
});

export default userSlice.reducer;
