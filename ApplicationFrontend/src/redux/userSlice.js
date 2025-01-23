import React from "react";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import setDefaultToken from "../utils/setDefaultToken";
import {
  addUserDetails,
  changeProfileImage,
  commentOnScream,
  createPost,
  fetchScreamDetails,
  fetchUserDetails,
  getAuthenticatedUser,
  likeScream,
  readNotifications,
  signInUser,
  signupUser,
  unlikeScream,
} from "./userActions";

const initialState = {
  credentials: {},
  openNotificationModel: false,
  loading: {
    signup: false,
    signin: false,
    app: false,
    post: false,
    onePost: false,
    addComment: false,
    userData: false,
  },

  screams: [],
  notifications: [],
  messageNotifications: [],
  likes: [],
  comments: [],
  scream: {},
  userData: {
    user: {},
    screams: [],
  },
  errors: {
    signin: {},
    signup: {},
  },
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
        if (state.userData.user.handle === action.payload.userHandle) {
          state.userData.screams.unshift(newScream);
        }
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
      state.userData.screams = state.userData.screams.map((scream) =>
        scream.screamId === action.payload.screamId
          ? { ...scream, likeCount: action.payload.likeCount }
          : scream
      );
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
      state.userData.screams = state.userData.screams.map((scream) =>
        scream.screamId === action.payload.screamId
          ? { ...scream, commentCount: action.payload.commentCount }
          : scream
      );
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
    // toggle Notification  Model

    toggleNotificationModal: (state, action) => {
      state.openNotificationModel = !state.openNotificationModel;
    },
    ///  update profile image real  time
    updateProfileImage: (state, action) => {
      // update user data user
      if (
        Object.keys(state.userData.user).length !== 0 &&
        state.userData.user.profileImage !== action.payload.profileImage
      ) {
        state.userData.user = {
          ...state.userData.user,
          profileImage: action.payload.profileImage,
        };
      }
      // update user data screams

      if (state.userData.screams.length !== 0) {
        state.userData.screams = state.userData.screams.map((scream) =>
          scream.profileImage !== action.payload.profileImage
            ? { ...scream, profileImage: action.payload.profileImage }
            : scream
        );
      }
      // update screams
      if (state.screams.length > 0) {
        state.screams = state.screams.map((scream) =>
          scream.screamId === action.payload.screamId &&
          scream.profileImage !== action.payload.profileImage
            ? { ...scream, profileImage: action.payload.profileImage }
            : scream
        );
      }
      ///  update notifications

      state.notifications = state.notifications.map((notification) =>
        notification.sender === action.payload.userHandle
          ? { ...notification, profileImage: action.payload.profileImage }
          : notification
      );
      /// update scream
      if (Object.keys(state.scream).length > 0) {
        state.scream =
          state.scream.userHandle === action.payload.userHandle &&
          state.scream.profileImage !== action.payload.profileImage
            ? {
                ...state.scream,
                profileImage: action.payload.profileImage,
              }
            : state.scream;
      }
      /// update comments
      if (state.comments.length > 0) {
        state.comments = state.comments.map((comment) =>
          comment.userHandle === action.payload.userHandle &&
          comment.profileImage !== action.payload.profileImage
            ? {
                ...comment,
                profileImage: action.payload.profileImage,
              }
            : comment
        );
      }
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
        state.errors.signup = action.payload;
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
        state.errors.signin = action.payload;
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
          state.userData.screams.unshift(newScream);
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
        // update screams
        state.screams = state.screams.map((scream) =>
          scream.screamId === action.meta.arg
            ? { ...scream, likeCount: action.payload.likeCount }
            : scream
        );
        state.likes.unshift(action.payload);
        // update scream
        if (Object.entries(state.scream).length > 0) {
          state.scream =
            state.scream.screamId === action.payload.screamId
              ? { ...state.scream, likeCount: action.payload.likeCount }
              : state.scream;
        }
        state.userData.screams = state.userData.screams.map((scream) =>
          scream.screamId === action.payload.screamId
            ? { ...scream, likeCount: action.payload.likeCount }
            : scream
        );
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
        state.userData.screams = state.userData.screams.map((scream) =>
          scream.screamId === action.payload.screamId
            ? { ...scream, likeCount: action.payload.likeCount }
            : scream
        );
        state.likes = state.likes.filter(
          (like) => like.screamId !== action.payload.screamId
        );
        //update scream
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
        // state.userData.screams = state.userData.screams.map((scream) =>
        //   scream.screamId === action.payload.screamId
        //     ? { ...scream, commentCount: action.payload.commentCount }
        //     : scream
        // );
      })
      .addCase(commentOnScream.rejected, (state, action) => {
        state.loading.comment = false;
      })
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading.userData = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading.userData = false;
        state.userData.user = action.payload.user;
        state.userData.screams = action.payload.screams;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading.userData = false;
      })
      .addCase(addUserDetails.fulfilled, (state, action) => {
        state.credentials = {
          ...state.credentials,
          school: action.payload?.school,
          location: action.payload?.location,
          bio: action.payload?.bio,
        };
        state.userData.user = {
          ...state.userData.user,
          ...action.payload,
        };
      })
      .addCase(addUserDetails.rejected, (state) => {
        state.errors = action.payload;
      })
      ///  change profile picture
      .addCase(changeProfileImage.fulfilled, (state, action) => {
        state.credentials = {
          ...state.credentials,
          profileImage: action.payload,
        };
        state.userData.user = {
          ...state.userData.user,
          profileImage: action.payload,
        };
        // update also  the scream profile image
        state.screams = state.screams.map((scream) => {
          if (
            scream.userHandle === state.userData.user.handle &&
            scream.profileImage !== action.payload
          ) {
            return {
              ...scream,
              profileImage: action.payload,
            };
          } else {
            return scream;
          }
        });
        state.userData.screams = state.userData.screams.map((scream) =>
          scream.userHandle === state.userData.user.handle
            ? { ...scream, profileImage: action.payload }
            : scream
        );
        state.notifications = state.notifications.map((notification) =>
          notification.sender === state.userData.user.handle
            ? { ...notification, profileImage: action.payload }
            : notification
        );
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
  toggleNotificationModal,
  updateProfileImage,
} = userSlice.actions;

export default userSlice.reducer;
