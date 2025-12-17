import Settings from "../models/Settings.js";
import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import { ErrorHandler } from "../utils/utility.js";

// Get all settings (admin only)
export const getSettings = catchAsyncError(async (req, res, next) => {
  const settings = await Settings.getSettings();
  
  res.status(200).json({
    success: true,
    settings: {
      taskCount: settings.taskCount,
      taskMinPoints: settings.taskMinPoints,
      taskMaxPoints: settings.taskMaxPoints,
      scratchCardCount: settings.scratchCardCount,
      scratchCardMinPoints: settings.scratchCardMinPoints,
      scratchCardMaxPoints: settings.scratchCardMaxPoints,
      redeemPaused: settings.redeemPaused,
      minRedeemAmountIndia: settings.minRedeemAmountIndia,
      minRedeemAmountOther: settings.minRedeemAmountOther,
      redeemAmountsIndia: settings.redeemAmountsIndia,
      redeemAmountsOther: settings.redeemAmountsOther,
      androidMinVersion: settings.androidMinVersion,
      androidMinVersionCode: settings.androidMinVersionCode,
      flutterMinVersion: settings.flutterMinVersion,
      flutterMinVersionCode: settings.flutterMinVersionCode,
      forceUpdateAndroid: settings.forceUpdateAndroid,
      forceUpdateFlutter: settings.forceUpdateFlutter,
      updateMessage: settings.updateMessage,
      updateUrlAndroid: settings.updateUrlAndroid,
      updateUrlFlutter: settings.updateUrlFlutter,
    },
  });
});

// Get public redeem settings (for users)
export const getRedeemSettings = catchAsyncError(async (req, res, next) => {
  const settings = await Settings.getSettings();
  
  res.status(200).json({
    success: true,
    redeemSettings: {
      minRedeemAmountIndia: settings.minRedeemAmountIndia,
      minRedeemAmountOther: settings.minRedeemAmountOther,
      redeemAmountsIndia: settings.redeemAmountsIndia,
      redeemAmountsOther: settings.redeemAmountsOther,
      redeemPaused: settings.redeemPaused,
    },
  });
});

// Check app update (for mobile apps)
export const checkAppUpdate = catchAsyncError(async (req, res, next) => {
  const { platform, version, versionCode } = req.query;
  
  if (!platform || !version) {
    return next(new ErrorHandler("Platform and version are required", 400));
  }
  
  const settings = await Settings.getSettings();
  
  let updateInfo = {
    updateAvailable: false,
    forceUpdate: false,
    message: "",
    minVersion: "",
    currentVersion: version,
    updateUrl: "",
  };
  
  if (platform === "android") {
    const currentVersionCode = versionCode ? parseInt(versionCode) : 0;
    const minVersionCode = settings.androidMinVersionCode || 0;
    
    updateInfo.updateAvailable = currentVersionCode < minVersionCode;
    updateInfo.forceUpdate = settings.forceUpdateAndroid || false;
    updateInfo.message = settings.updateMessage || "A new version is available. Please update to continue.";
    updateInfo.minVersion = settings.androidMinVersion || "3.1.3";
    updateInfo.updateUrl = settings.updateUrlAndroid || "";
  } else if (platform === "flutter") {
    const currentVersionCode = versionCode ? parseInt(versionCode) : 0;
    const minVersionCode = settings.flutterMinVersionCode || 0;
    
    updateInfo.updateAvailable = currentVersionCode < minVersionCode;
    updateInfo.forceUpdate = settings.forceUpdateFlutter || false;
    updateInfo.message = settings.updateMessage || "A new version is available. Please update to continue.";
    updateInfo.minVersion = settings.flutterMinVersion || "1.0.0";
    updateInfo.updateUrl = settings.updateUrlFlutter || "";
  } else {
    return next(new ErrorHandler("Invalid platform. Use 'android' or 'flutter'", 400));
  }
  
  res.status(200).json({
    success: true,
    updateInfo,
  });
});

// Update settings
export const updateSettings = catchAsyncError(async (req, res, next) => {
  const {
    taskCount,
    taskMinPoints,
    taskMaxPoints,
    scratchCardCount,
    scratchCardMinPoints,
    scratchCardMaxPoints,
    redeemPaused,
    minRedeemAmountIndia,
    minRedeemAmountOther,
    redeemAmountsIndia,
    redeemAmountsOther,
    androidMinVersion,
    androidMinVersionCode,
    flutterMinVersion,
    flutterMinVersionCode,
    forceUpdateAndroid,
    forceUpdateFlutter,
    updateMessage,
    updateUrlAndroid,
    updateUrlFlutter,
  } = req.body;

  // Validate task settings
  if (taskCount !== undefined) {
    if (!Number.isInteger(taskCount) || taskCount < 1 || taskCount > 100) {
      return next(new ErrorHandler("Task count must be between 1 and 100", 400));
    }
  }

  if (taskMinPoints !== undefined) {
    if (!Number.isInteger(taskMinPoints) || taskMinPoints < 1) {
      return next(new ErrorHandler("Task min points must be a positive integer", 400));
    }
  }

  if (taskMaxPoints !== undefined) {
    if (!Number.isInteger(taskMaxPoints) || taskMaxPoints < 1) {
      return next(new ErrorHandler("Task max points must be a positive integer", 400));
    }
  }

  if (taskMinPoints !== undefined && taskMaxPoints !== undefined) {
    if (taskMinPoints > taskMaxPoints) {
      return next(new ErrorHandler("Task min points cannot be greater than max points", 400));
    }
  }

  // Validate scratch card settings
  if (scratchCardCount !== undefined) {
    if (!Number.isInteger(scratchCardCount) || scratchCardCount < 1 || scratchCardCount > 20) {
      return next(new ErrorHandler("Scratch card count must be between 1 and 20", 400));
    }
  }

  if (scratchCardMinPoints !== undefined) {
    if (!Number.isInteger(scratchCardMinPoints) || scratchCardMinPoints < 1) {
      return next(new ErrorHandler("Scratch card min points must be a positive integer", 400));
    }
  }

  if (scratchCardMaxPoints !== undefined) {
    if (!Number.isInteger(scratchCardMaxPoints) || scratchCardMaxPoints < 1) {
      return next(new ErrorHandler("Scratch card max points must be a positive integer", 400));
    }
  }

  if (scratchCardMinPoints !== undefined && scratchCardMaxPoints !== undefined) {
    if (scratchCardMinPoints > scratchCardMaxPoints) {
      return next(new ErrorHandler("Scratch card min points cannot be greater than max points", 400));
    }
  }

  // Validate redeem paused
  if (redeemPaused !== undefined && typeof redeemPaused !== "boolean") {
    return next(new ErrorHandler("Redeem paused must be a boolean", 400));
  }

  // Validate redeem amounts
  if (minRedeemAmountIndia !== undefined) {
    if (!Number.isInteger(minRedeemAmountIndia) || minRedeemAmountIndia < 1) {
      return next(new ErrorHandler("Minimum redeem amount for India must be a positive integer", 400));
    }
  }

  if (minRedeemAmountOther !== undefined) {
    if (!Number.isInteger(minRedeemAmountOther) || minRedeemAmountOther < 1) {
      return next(new ErrorHandler("Minimum redeem amount for other countries must be a positive integer", 400));
    }
  }

  if (redeemAmountsIndia !== undefined) {
    if (!Array.isArray(redeemAmountsIndia)) {
      return next(new ErrorHandler("Redeem amounts for India must be an array", 400));
    }
    if (redeemAmountsIndia.some(amount => !Number.isInteger(amount) || amount < 1)) {
      return next(new ErrorHandler("All redeem amounts for India must be positive integers", 400));
    }
  }

  if (redeemAmountsOther !== undefined) {
    if (!Array.isArray(redeemAmountsOther)) {
      return next(new ErrorHandler("Redeem amounts for other countries must be an array", 400));
    }
    if (redeemAmountsOther.some(amount => !Number.isInteger(amount) || amount < 1)) {
      return next(new ErrorHandler("All redeem amounts for other countries must be positive integers", 400));
    }
  }

  // Validate app version settings
  if (androidMinVersionCode !== undefined) {
    if (!Number.isInteger(androidMinVersionCode) || androidMinVersionCode < 1) {
      return next(new ErrorHandler("Android min version code must be a positive integer", 400));
    }
  }

  if (flutterMinVersionCode !== undefined) {
    if (!Number.isInteger(flutterMinVersionCode) || flutterMinVersionCode < 1) {
      return next(new ErrorHandler("Flutter min version code must be a positive integer", 400));
    }
  }

  if (forceUpdateAndroid !== undefined && typeof forceUpdateAndroid !== "boolean") {
    return next(new ErrorHandler("Force update Android must be a boolean", 400));
  }

  if (forceUpdateFlutter !== undefined && typeof forceUpdateFlutter !== "boolean") {
    return next(new ErrorHandler("Force update Flutter must be a boolean", 400));
  }

  // Get or create settings
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  // Update only provided fields
  if (taskCount !== undefined) settings.taskCount = taskCount;
  if (taskMinPoints !== undefined) settings.taskMinPoints = taskMinPoints;
  if (taskMaxPoints !== undefined) settings.taskMaxPoints = taskMaxPoints;
  if (scratchCardCount !== undefined) settings.scratchCardCount = scratchCardCount;
  if (scratchCardMinPoints !== undefined) settings.scratchCardMinPoints = scratchCardMinPoints;
  if (scratchCardMaxPoints !== undefined) settings.scratchCardMaxPoints = scratchCardMaxPoints;
  if (redeemPaused !== undefined) settings.redeemPaused = redeemPaused;
  if (minRedeemAmountIndia !== undefined) settings.minRedeemAmountIndia = minRedeemAmountIndia;
  if (minRedeemAmountOther !== undefined) settings.minRedeemAmountOther = minRedeemAmountOther;
  if (redeemAmountsIndia !== undefined) settings.redeemAmountsIndia = redeemAmountsIndia;
  if (redeemAmountsOther !== undefined) settings.redeemAmountsOther = redeemAmountsOther;
  if (androidMinVersion !== undefined) settings.androidMinVersion = androidMinVersion;
  if (androidMinVersionCode !== undefined) settings.androidMinVersionCode = androidMinVersionCode;
  if (flutterMinVersion !== undefined) settings.flutterMinVersion = flutterMinVersion;
  if (flutterMinVersionCode !== undefined) settings.flutterMinVersionCode = flutterMinVersionCode;
  if (forceUpdateAndroid !== undefined) settings.forceUpdateAndroid = forceUpdateAndroid;
  if (forceUpdateFlutter !== undefined) settings.forceUpdateFlutter = forceUpdateFlutter;
  if (updateMessage !== undefined) settings.updateMessage = updateMessage;
  if (updateUrlAndroid !== undefined) settings.updateUrlAndroid = updateUrlAndroid;
  if (updateUrlFlutter !== undefined) settings.updateUrlFlutter = updateUrlFlutter;

  await settings.save();

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    settings: {
      taskCount: settings.taskCount,
      taskMinPoints: settings.taskMinPoints,
      taskMaxPoints: settings.taskMaxPoints,
      scratchCardCount: settings.scratchCardCount,
      scratchCardMinPoints: settings.scratchCardMinPoints,
      scratchCardMaxPoints: settings.scratchCardMaxPoints,
      redeemPaused: settings.redeemPaused,
      minRedeemAmountIndia: settings.minRedeemAmountIndia,
      minRedeemAmountOther: settings.minRedeemAmountOther,
      redeemAmountsIndia: settings.redeemAmountsIndia,
      redeemAmountsOther: settings.redeemAmountsOther,
      androidMinVersion: settings.androidMinVersion,
      androidMinVersionCode: settings.androidMinVersionCode,
      flutterMinVersion: settings.flutterMinVersion,
      flutterMinVersionCode: settings.flutterMinVersionCode,
      forceUpdateAndroid: settings.forceUpdateAndroid,
      forceUpdateFlutter: settings.forceUpdateFlutter,
      updateMessage: settings.updateMessage,
      updateUrlAndroid: settings.updateUrlAndroid,
      updateUrlFlutter: settings.updateUrlFlutter,
    },
  });
});

// Toggle redeem paused state (for backward compatibility)
export const toggleRedeem = catchAsyncError(async (req, res, next) => {
  const { paused } = req.body;

  if (paused !== undefined && typeof paused !== "boolean") {
    return next(
      new ErrorHandler(
        "Invalid value for paused. It should be true or false.",
        400
      )
    );
  }

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  settings.redeemPaused = paused !== undefined ? paused : !settings.redeemPaused;
  await settings.save();

  res.status(200).json({
    success: true,
    redeemStatus: settings.redeemPaused,
  });
});
