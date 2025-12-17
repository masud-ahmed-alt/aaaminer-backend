import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import ScratchCard from "../models/ScratchCard.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import {
  getActivityLog,
  getAvailableScratchCard,
  getAvailableTasks,
  sendTelegramMessage,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import Carousel from "../models/Carousel.js";
import { logger } from "../utils/logger.js";

const createTask = async () => {
  try {
    // Get settings from database
    const settings = await Settings.getSettings();
    
    const taskNameTemplates = [
      "Unlock hidden treasure",
      "Defend your kingdom",
      "Solve the puzzle quest",
      "Conquer the battlefield",
      "Upgrade your skills",
      "Survive the challenge",
      "Discover secret paths",
      "Defeat the boss",
      "Collect rare items",
      "Rule the leaderboard",
    ];

    // Shuffle task names
    const shuffledTemplates = taskNameTemplates.sort(() => Math.random() - 0.5);
    const tasks = [];

    // Use settings from database
    const taskCount = settings.taskCount || 10;
    const minPoints = settings.taskMinPoints || 40;
    const maxPoints = settings.taskMaxPoints || 65;

    for (let i = 0; i < taskCount; i++) {
      // Use template if available, otherwise use generic name
      const taskName = shuffledTemplates[i] || `Task ${i + 1}`;
      
      // Generate random points within configured range
      const rewardPoints = Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints;

      tasks.push({
        taskName,
        rewardPoints,
      });
    }

    await Task.insertMany(tasks);
    getActivityLog(`New ${taskCount} tasks generated successfully with points range ${minPoints}-${maxPoints}.`);
  } catch (error) {
    getActivityLog("Failed to generate new tasks: " + error.message);
  }
};

const createScratchCard = async () => {
  try {
    // Get settings from database
    const settings = await Settings.getSettings();
    
    // Use settings from database
    const cardCount = settings.scratchCardCount || 4;
    const minPoints = settings.scratchCardMinPoints || 30;
    const maxPoints = settings.scratchCardMaxPoints || 40;

    // Generate random points within configured range
    const randomPoints = Array.from(
      { length: cardCount },
      () => Math.floor(Math.random() * (maxPoints - minPoints + 1)) + minPoints
    );

    // Shuffle the points for randomness
    const shuffledPoints = randomPoints.sort(() => Math.random() - 0.5);

    const scratchCards = shuffledPoints.map((points) => ({
      points,
      desc: `🎉 Congratulations, you have just won ${points} points! 🎉`,
    }));

    await ScratchCard.insertMany(scratchCards);
    getActivityLog(`New ${cardCount} Scratch Cards generated with points range ${minPoints}-${maxPoints}.`);
  } catch (error) {
    getActivityLog(`Failed to create scratch card: ${error.message}`);
  }
};

export const getRanking = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    const { type } = req.query;

    if (!type) {
      return next(new ErrorHandler("Please select a type", 400));
    }

    let users = [];

    switch (type) {
      case "friend":
        users = await User.find({ referredBy: userId, isverified: true })
          .select("name walletPoints -_id")
          .sort({ walletPoints: -1 })
          .lean();
        break;

      case "toppers":
        // Top users based on wallet points
        users = await User.find({ isBanned: false, isverified: true })
          .select("name walletPoints -_id")
          .sort({ walletPoints: -1 })
          .limit(10)
          .lean();
        break;

      default:
        users = await User.find({ isBanned: false })
          .select("name walletPoints -_id")
          .sort({ walletPoints: -1 })
          .limit(100)
          .lean();
        break;
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    logger.error("Error in getRanking", error);
    return next(new ErrorHandler("Something went wrong", 500));
  }
});

export const generateDailyTasks = catchAsyncError(async () => {
  const task = await Task.find();
  if (task.length > 0) {
    const deleteTask = await Task.deleteMany({});
    if (deleteTask.deletedCount > 0) {
      await createTask();
    }
  } else {
    await createTask();
  }
});

export const generateScratchCard = catchAsyncError(async () => {
  const scratchCards = await ScratchCard.find();
  if (scratchCards.length > 0) {
    const deleteScratchCard = await ScratchCard.deleteMany({});
    if (deleteScratchCard.deletedCount > 0) {
      await createScratchCard();
    }
  } else {
    await createScratchCard();
  }
});

export const getUserTasks = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    if (!userId) return next(new ErrorHandler("User ID is required", 400));
    const tasks = await getAvailableTasks(userId);
    if (!tasks || tasks.length === 0)
      return next(
        new ErrorHandler(
          "Congratulations! You have successfully completed all the tasks. Please comeback after sometimes!!!",
          404
        )
      );
    res.status(200).json({ 
      success: true,
      tasks 
    });
  } catch (error) {
    logger.error("Error fetching user tasks", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const getUserScratchCards = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    if (!userId) return next(new ErrorHandler("User ID is required", 400));
    const scratchCard = await getAvailableScratchCard(userId);
    if (!scratchCard || scratchCard.length === 0)
      return next(
        new ErrorHandler(
          "You don't have any Scratch Cards right now, Please check after sometimes!",
          404
        )
      );
    res.status(200).json({ 
      success: true,
      scratchCard 
    });
  } catch (error) {
    logger.error("Error fetching user scratchCard", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

export const completeTask = catchAsyncError(async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const userId = req.user;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new ErrorHandler("Task not found", 404));
    }

    const isTaskCompleted =
      Array.isArray(task.completedBy) && task.completedBy.includes(userId);
    if (isTaskCompleted) {
      return next(new ErrorHandler("Task already completed", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.walletPoints += task.rewardPoints;

    task.completedBy = Array.isArray(task.completedBy) ? task.completedBy : [];
    task.completedBy.push(userId);

    await user.save();
    await task.save();
    getActivityLog(user.name, `completed task, id: ${task.id}`);

    res.status(200).json({
      success: true,
      message: "Task completed successfully",
    });
  } catch (error) {
    next(new ErrorHandler("An error occurred while completing the task", 500));
  }
});

export const completeScratchCard = catchAsyncError(async (req, res, next) => {
  try {
    const { scratchId } = req.body;
    const userId = req.user;

    const scratchCard = await ScratchCard.findById(scratchId);
    if (!scratchCard) {
      return next(new ErrorHandler("Scratch Card not found", 404));
    }

    const isScratchCardCompleted =
      Array.isArray(scratchCard.completedBy) &&
      scratchCard.completedBy.includes(userId);
    if (isScratchCardCompleted) {
      return next(new ErrorHandler("Scratch Card already completed", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.walletPoints += scratchCard.points;

    scratchCard.completedBy = Array.isArray(scratchCard.completedBy)
      ? scratchCard.completedBy
      : [];
    scratchCard.completedBy.push(userId);

    await user.save();
    await scratchCard.save();
    getActivityLog(user.name, `completed scratch card, id: ${scratchCard.id}`);
    res.status(200).json({
      success: true,
      message: "Scratch Card completed successfully",
    });
  } catch (error) {
    logger.error("Error completing Scratch Card", error);
    next(new ErrorHandler("An error occurred while completing the task", 500));
  }
});

export const getCarousal = catchAsyncError(async (req, res, next) => {
  const carousal = await Carousel.find().select("url").sort("-createdAt");

  const host = req.get("host");
  const hostname = host.split(":")[0];

  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isIp = /^[0-9.]+$/.test(hostname);

  const baseUrl = `${req.protocol}://${host}${isLocal || isIp ? "/" : "/api/"}`;
  const updatedCarousal = carousal.map((item) => ({
    id: item._id,
    url: /^https?:\/\//i.test(item.url) ? item.url : `${baseUrl}${item.url}`,
  }));

  res.status(200).json({
    success: true,
    carousal: updatedCarousal,
  });
});
