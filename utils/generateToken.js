import jwt from "jsonwebtoken";

// Keep token shape consistent with sendToken (use _id)
const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export default generateToken;
