import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import ScratchCard from "../models/ScratchCard.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import {
  getActivityLog,
  getAvailableScratchCard,
  getAvailableTasks,
  sendTelegramMessage,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import Carousel from "../models/Carousel.js";
import TopTenUsers from "../models/TopTenUsers.js";

const createTask = async () => {
  try {
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

    // Pick one special index for isSpecial flag
    const specialIndex = Math.floor(Math.random() * 10);

    // Pick 2 unique random indexes for high-reward tasks
    const highRewardIndexes = [];
    while (highRewardIndexes.length < 2) {
      const randomIndex = Math.floor(Math.random() * 10);
      if (!highRewardIndexes.includes(randomIndex)) {
        highRewardIndexes.push(randomIndex);
      }
    }

    for (let i = 0; i < 10; i++) {
      let rewardPoints;

      // Assign higher reward points (301–315) to 2 random tasks
      if (highRewardIndexes.includes(i)) {
        rewardPoints = Math.floor(Math.random() * (315 - 301 + 1)) + 301;
      } else {
        rewardPoints = Math.floor(Math.random() * (65 - 40 + 1)) + 40;
      }

      tasks.push({
        taskName: shuffledTemplates[i],
        rewardPoints,
        isSpecial: i === specialIndex,
      });
    }

    await Task.insertMany(tasks);
    getActivityLog("New tasks generated successfully.");
  } catch (error) {
    getActivityLog("Failed to generate new tasks: " + error.message);
  }
};



const createScratchCard = async () => {
  try {
    // Generate 4 random points between 30–40
    const randomPoints = Array.from(
      { length: 4 },
      () => Math.floor(Math.random() * (40 - 30 + 1)) + 30
    );

    // Shuffle the points for randomness
    const shuffledPoints = randomPoints.sort(() => Math.random() - 0.5);

    const scratchCards = shuffledPoints.map((points) => ({
      points,
      desc: `🎉 Congratulations, you have just won ${points} points! 🎉`,
    }));

    await ScratchCard.insertMany(scratchCards);
    getActivityLog("New Scratch Cards generated.....");
  } catch (error) {
    getActivityLog(`Failed to create scratch card.`);
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
        const topUsers = await TopTenUsers.find()
          .populate("user", "name walletPoints -_id")
          .lean();

        users = topUsers.map((entry) => ({
          name: entry.user?.name || "Unknown",
          walletPoints: entry.user?.walletPoints || 0,
        }));
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
    console.error("Error in getRanking:", error);
    return next(new ErrorHandler("Something went wrong", 500));
  }
});

export const generateDailyTasks = catchAsyncError(async () => {
  const task = await Task.find();
  if (task.length > 0) {
    const deleteTask = await Task.deleteMany({});
    if (deleteTask.deletedCount > 0) {
      console.log("Existing Task deleted");
      await createTask();
    } else {
      console.log("No tasks to deleted");
    }
  } else if (task.length === 0) {
    console.log("No existing tasks found. Creating new tasks...");
    await createTask();
  }
});

export const generateScratchCard = catchAsyncError(async () => {
  const scratchCards = await ScratchCard.find();
  if (scratchCards.length > 0) {
    const deleteScratchCard = await ScratchCard.deleteMany({});
    if (deleteScratchCard.deletedCount > 0) {
      console.log("Existing Scratch Cards deleted");
      await createScratchCard();
    } else {
      console.log("No Scratch Cards to delete");
    }
  } else if (scratchCards.length === 0) {
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
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching user tasks");
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
    res.status(200).json({ scratchCard });
  } catch (error) {
    console.error("Error fetching user scratchCard");
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
    console.error("Error completing Scratch Card:");
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
    url: `${baseUrl}${item.url}`,
  }));

  res.status(200).json({
    success: true,
    carousal: updatedCarousal,
  });
});
