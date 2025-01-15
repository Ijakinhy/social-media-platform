import React from "react";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import setDefaultToken from "../utils/setDefaultToken";
import {
  commentOnScream,
  createPost,
  fetchScreamDetails,
  getAuthenticatedUser,
  likeScream,
  readNotifications,
  signInUser,
  signupUser,
  unlikeScream,
} from "./userActions";

const initialState = {
  credentials: {},
  loading: {
    signup: false,
    signin: false,
    app: false,
    post: false,
    onePost: false,
    addComment: false,
  },

  screams: [],
  notifications: [],
  messageNotifications: [],
  likes: [],
  comments: [],
  scream: {},
  errors: {},
};

///  signup

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    ///  add real time update to add scream
    addNewScream: (state, action) => {
      const newScream = action.payload;
      if (
        !state.screams.some((scream) => scream.screamId === newScream.screamId)
      ) {
        state.screams.unshift(newScream);
      }
    },
    ///  update the like count in real time
    updateLikeCount: (state, action) => {
      state.screams = state.screams.map((scream) => {
        return scream.screamId === action.payload.screamId
          ? { ...scream, likeCount: action.payload.likeCount }
          : scream;
      });
      state.scream = state.scream.screamId === action.payload.screamId && {
        ...state.scream,
        likeCount: action.payload.likeCount,
      };
    },
    // update the comment count in  real time
    updateCommentCount: (state, action) => {
      state.screams = state.screams.map((scream) =>
        scream.screamId === action.payload.screamId
          ? { ...scream, commentCount: action.payload.commentCount }
          : scream
      );
      state.scream = state.scream.screamId === action.payload.screamId && {
        ...state.scream,
        commentCount: action.payload.commentCount,
      };
    },
    // update the scream comments array on adding the comment
    updateComments: (state, action) => {
      if (
        !state.comments.some(
          (comment) => comment.commentId === action.payload.commentId
        )
      ) {
        state.comments.push(action.payload);
      }
    },
    // real time notification  on like
    addLikeNotification: (state, action) => {
      if (
        !state.notifications.some(
          (notification) =>
            notification.notificationId === action.payload.notificationId &&
            notification.sender === action.payload.sender &&
            (notification.type === "like" || notification.type === "comment")
        )
      ) {
        state.notifications.unshift(action.payload);
      }
    },

    // delete real time notification  on unlike
    deleteNotificationOnUnlike: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) =>
          !(
            notification.screamId === action.payload.screamId &&
            notification.sender === action.payload.sender &&
            notification.type === "like"
          )
      );
    },
  },
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
        state.likes = action.payload.user.likes;
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
        const newScream = action.payload;
        if (
          !state.screams.some(
            (scream) => scream.screamId === newScream.screamId
          )
        ) {
          state.screams.unshift(newScream);
        }
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
      })
      ///  like scream
      .addCase(likeScream.fulfilled, (state, action) => {
        state.screams = state.screams.map((scream) =>
          scream.screamId === action.payload.screamId
            ? { ...scream, likeCount: action.payload.likeCount }
            : scream
        );
        state.likes.unshift(action.payload);
        state.scream =
          state.scream.screamId === action.payload.screamId
            ? { ...state.scream, likeCount: action.payload.likeCount }
            : state.scream;
      })
      ///  unlike scream
      .addCase(unlikeScream.fulfilled, (state, action) => {
        state.screams = state.screams.map((scream) =>
          scream.screamId === action.payload.screamId
            ? {
                ...scream,
                likeCount: action.payload.likeCount,
              }
            : scream
        );
        state.likes = state.likes.filter(
          (like) => like.screamId !== action.payload.screamId
        );
        state.scream =
          state.scream.screamId === action.payload.screamId
            ? { ...state.scream, likeCount: action.payload.likeCount }
            : state.scream;
      })
      // fetch  one scream  details
      .addCase(fetchScreamDetails.pending, (state) => {
        state.loading.onePost = true;
      })
      .addCase(fetchScreamDetails.fulfilled, (state, action) => {
        state.loading.onePost = false;
        state.scream = action.payload.scream;
        state.comments = action.payload.comments;
      })
      .addCase(fetchScreamDetails.rejected, (state, action) => {
        state.loading.onePost = false;
      })

      ///  add comment on scream
      .addCase(commentOnScream.pending, (state) => {
        state.loading.comment = true;
      })
      .addCase(commentOnScream.fulfilled, (state, action) => {
        state.loading.addComment = false;
        state.comments.push(action.payload);
        state.scream = state.scream.screamId === action.payload.screamId && {
          ...state.scream,
          commentCount: action.payload.commentCount,
        };

        state.screams = state.screams.map((scream) =>
          scream.screamId === action.payload.screamId
            ? { ...scream, commentCount: action.payload.commentCount }
            : scream
        );
      })
      .addCase(commentOnScream.rejected, (state, action) => {
        state.loading.comment = false;
      });
  },
});

export const {
  addNewScream,
  addLikeNotification,
  deleteNotificationOnUnlike,
  updateLikeCount,
  updateCommentCount,
  updateComments,
} = userSlice.actions;

export default userSlice.reducer;
