import User from "../models/User.js";
import crypto from "crypto";
import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import { ErrorHandler } from "../utils/utility.js";

export const handleCallback = catchAsyncError(async (req, res, next) => {
  const { user_id, value, token, signature } = req.query;

  if (!user_id || !value || !token || !signature) {
    return next(new ErrorHandler("Missing parameters", 400));
  }

  console.log("Received callback with parameters:", {
    value,
  });

  const template = `${process.env.PUBSCALE_SECRET_KEY}.${user_id}.${Math.trunc(
    Number(value)
  )}.${token}`;
  const hash = crypto.createHash("md5").update(template).digest("hex");

  if (hash.toLowerCase() !== signature.toLowerCase()) {
    console.error("Invalid signature", signature, "Expected:", hash);
    return next(new ErrorHandler("Invalid signature", 403));
  }

  const updatedUser = await User.findOneAndUpdate(
    { username: user_id },
    { $inc: { walletPoints: parseInt(value, 10) } },
    { new: true }
  );

  console.log("Updated user:", updatedUser);
  if (!updatedUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Wallet points updated successfully",
    user: {
      id: updatedUser._id,
      walletPoints: updatedUser.walletPoints,
    },
  });
});
