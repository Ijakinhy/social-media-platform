const axios = require("axios");
const { db } = require("../utils/admin");
const { firebaseConfig } = require("../utils/config");

exports.signUpUser = async (req, res) => {
  try {
    const newUser = {
      handle: req.body.handle,
      email: req.body.email,
      profileImage:
        "http://127.0.0.1:9199/v0/b/social-platform-ijakinhy.firebasestorage.app/o/default.jpg?alt=media",
      password: req.body.password,
    };
    let errors = {};
    if (!newUser.handle) {
      errors.handle = "Must not be empty";
    }

    if (!newUser.password) {
      errors.password = "Must not be empty";
    } else if (newUser.password.length < 6) {
      errors.password = "Must be at least 6 characters long";
    }

    if (!newUser.email) {
      errors.email = "Must not be empty";
    } else if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(newUser.email)) {
      errors.email = "Must be a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const signUpUrl = `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`;
    const userDoc = await db.doc(`/users/${newUser.handle}`).get();
    if (userDoc.exists) {
      return res.status(400).json({ error: "User already exists." });
    }
    {
      const response = await axios.post(signUpUrl, {
        email: newUser.email,
        password: newUser.password,
        returnSecureToken: true,
      });

      db.doc(`/users/${newUser.handle}`).set({
        email: newUser.email,
        handle: newUser.handle,
        userId: response.data.localId,
        profileImage: newUser.profileImage,
      });
      return res.status(201).json({
        newUser,
        token: response.data.idToken,
        userId: response.data.localId,
        refreshToken: response.data.refreshToken,
      });
    }
  } catch (error) {
    if (
      error.response &&
      error.response.data.error.message === "EMAIL_EXISTS"
    ) {
      return res.status(400).json({ email: "This email is already in use" });
    }

    return res
      .status(500)
      .json({ general: "Something went wrong,please try again!" });
  }
};

exports.signInUser = async (req, res) => {
  try {
    const loginUrl = `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;
    const response = await axios.post(loginUrl, {
      email: req.body.email,
      password: req.body.password,
      returnSecureToken: true,
    });

    return res.status(201).json({
      token: response.data.idToken,
      userId: response.data.localId,
      refreshToken: response.data.refreshToken,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: error.message });
  }
};
