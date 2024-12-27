import React from "react";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  userData: {},
  loading: {
    signup: false,
    signin: false,
    app: false,
  },
  screams: [],
  errors: {},
};

///  signup

export const signupUser = createAsyncThunk(
  "/user/signUp",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post("/api/signUp", formData);
      const token = res.data.token;
      localStorage.setItem("token", token);

      return res.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error?.response?.data);
    }
  }
);

/// sign  in

export const signInUser = createAsyncThunk(
  "user/signIn",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post("/api/signIn", formData);
      const token = res.data.token;
      localStorage.setItem("token", token);

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

      console.log(userRes, screamRes);

      return {
        user: userRes,
        screams: screamRes,
      };
    } catch (error) {
      console.log(error);
    }
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
        state.userData = action.payload;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading.signup = false;
        state.errors = action.payload.error;
      })
      .addCase(getAuthenticatedUser.fulfilled, (state, action) => {
        state.loading.signin = false;
        state.userData = action.payload.user;
        state.screams = action.payload.screams;
      })
      .addCase(getAuthenticatedUser.rejected, (state, action) => {
        state.loading.signin = false;
        state.errors = action.payload.error;
      });
  },
});

export default userSlice.reducer;
