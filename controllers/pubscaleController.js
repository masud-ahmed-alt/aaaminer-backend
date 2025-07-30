import User from "../models/User.js";
import crypto from "crypto";
import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import { ErrorHandler } from "../utils/utility.js";

const PUBSCALE_SECRET_KEY = "1cfb01d1-0a85-4910-b6af-81ff2872a06b";

export const handleCallback = catchAsyncError(async (req, res, next) => {
  const { user_id, value, token, signature } = req.query;

  if (!user_id || !value || !token || !signature) {
    return next(new ErrorHandler("Missing parameters", 400));
  }

  // Generate and validate signature
  const template = `${PUBSCALE_SECRET_KEY}.${user_id}.${Math.trunc(
    Number(value)
  )}.${token}`;
  const hash = crypto.createHash("md5").update(template).digest("hex");

  if (hash.toLowerCase() !== signature.toLowerCase()) {
    console.error("Invalid signature", signature, "Expected:", hash);
    return next(new ErrorHandler("Invalid signature", 403));
  }

  // Treat user_id as username for lookup
  const updatedUser = await User.findOneAndUpdate(
    { username: user_id },
    { $inc: { walletPoints: parseInt(value, 10) } },
    { new: true }
  );
  console.log("Updated User:", updatedUser);
  if (!updatedUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Successful update response
  res.status(200).json({
    success: true,
    message: "Wallet points updated successfully",
    user: {
      id: updatedUser._id,
      walletPoints: updatedUser.walletPoints,
    },
  });
});
