const validateSAddScream = (data) => {
  const { description, userHandle, screamImage, profileImage } = data;
  let errors = {};
  if (!description) {
    throw new Error("All fields are required.");
  }
};
