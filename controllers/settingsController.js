import { setRedeemPaused, getRedeemPaused } from "../config/settings.js";
import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import { ErrorHandler } from "../utils/utility.js";

// Get the all settings
export const getSettings = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    success: true,
    redeemPaused: getRedeemPaused(),
  });
});

// Toggle redeem paused state
export const toggleRedeem = catchAsyncError(async (req, res, next) => {
  const { paused } = req.body;

  if (!paused && paused !== false) {
    return next(
      new ErrorHandler(
        "Invalid value for paused. It should be true or false.",
        400
      )
    );
  }

  setRedeemPaused(paused);
  res.status(200).json({
    success: true,
    redeemStatus: getRedeemPaused(),
  });
});
