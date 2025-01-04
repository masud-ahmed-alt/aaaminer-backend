import { catchAsyncError } from '../middlewares/errorMiddleware.js';
import ScratchCard from '../models/ScratchCard.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { getAvailableScratchCard, getAvailableTasks, sendTelegramMessage } from '../utils/features.js';
import { ErrorHandler } from '../utils/utility.js';
import Carousel from "../models/Carousel.js";

export const getRanking = catchAsyncError(async (req, res, next) => {

  try {
    const userid = req.user;
    const { type } = req.query;

    if (!type) {
      return next(new ErrorHandler("Please select a type", 400));
    }

    let users;

    if (type === 'all') {
      users = await User.find()
        .select("username walletPoints")
        .sort({ walletPoints: -1 });
    } else if (type === 'friend') {
      users = await User.find({ referredBy: userid, isverified: true })
        .select("username walletPoints")
        .sort({ walletPoints: -1 });
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Something went wrong", 500));
  }
})

export const generateDailyTasks = catchAsyncError(async () => {

  try {
    const deleteTask = await Task.deleteMany({});
    if (deleteTask.deletedCount > 0) {
      console.log("Task deleted");
    } else {
      console.log("No tasks to delete");
    }
  } catch (error) {
    console.log("Error while deleting tasks: ", error.message || error);
  }

  try {

    const taskNameTemplates = [
      "Complete the level",
      "Build your empire",
      "Explore a new world",
      "Collect power-ups",
      "Access exclusive content",
      "Finish the mission",
      "Win the battle",
      "Reach the next stage",
      "Complete the challenge"
    ];

    const tasks = Array.from({ length: 10 }, () => {
      const rewardPoints = Math.floor(Math.random() * 90) + 10;
      const randomTemplate = taskNameTemplates[Math.floor(Math.random() * taskNameTemplates.length)];
      return {
        taskName: `${randomTemplate}`,
        rewardPoints,
      };
    });

    await Task.insertMany(tasks);
    const message = `🚨 New Task Alert! 🚨\n New tasks are available for you! Complete it on time to earn extra reward points and climb to the top of the leaderboard!`
    // const imageUrl = "./src/telegram/tasks.jpg"
    // sendTelegramMessage(message, imageUrl)
    console.log("Tasks created successfully");
  } catch (error) {
    console.log("Error while creating tasks: ", error.message || error);
  }
});

export const generateScratchCard = catchAsyncError(async () => {
  try {
    const deleteScratchCard = await ScratchCard.deleteMany({});
    if (deleteScratchCard.deletedCount > 0) {
      console.log("Existing Scratch Cards deleted");
    } else {
      console.log("No Scratch Cards to delete");
    }

    const randomPoints = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * (160 - 120 + 1)) + 120
    );

    const pointsArray = [0, ...randomPoints];
    const shuffledPoints = pointsArray.sort(() => Math.random() - 0.5);


    const scratchCards = shuffledPoints.map((points) => ({
      points,
      desc: points === 0
        ? "OOPS! Better luck next time!"
        : `🎉Congratulations, you have just won ${points} points!🎉`,
    }));

    await ScratchCard.insertMany(scratchCards);
    const message = `🎉 New Scratch Cards Are Here! 🎉\n We've initiated new scratch cards—scratch now to earn more points and boost your rewards!`
    // const imageUrl = "./src/telegram/scratchCard.jpg"
    // sendTelegramMessage(message, imageUrl)
    console.log("New Scratch Cards generated successfully");
  } catch (error) {
    console.error("Error generating Scratch Cards: ", error.message || error);
  }
});

export const getUserTasks = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    if (!userId) return next(new ErrorHandler('User ID is required', 400))
    const tasks = await getAvailableTasks(userId);
    if (!tasks || tasks.length === 0)
      return next(new ErrorHandler("Congratulations! You have successfully completed all the tasks. Please comeback after sometimes!!!", 404))
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return next(new ErrorHandler("Internal server error", 500))
  }
})

export const getUserScratchCards = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    if (!userId) return next(new ErrorHandler('User ID is required', 400))
    const scratchCard = await getAvailableScratchCard(userId);
    if (!scratchCard || scratchCard.length === 0)
      return next(new ErrorHandler("You don't have any Scratch Cards right now, Please check after sometimes!", 404))
    res.status(200).json({ scratchCard });
  } catch (error) {
    console.error('Error fetching user scratchCard:', error);
    return next(new ErrorHandler("Internal server error", 500))
  }
})

export const completeTask = catchAsyncError(async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const userId = req.user;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(new ErrorHandler("Task not found", 404));
    }

    const isTaskCompleted = Array.isArray(task.completedBy) && task.completedBy.includes(userId);
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

    res.status(200).json({
      success: true,
      message: "Task completed successfully"
    });
  } catch (error) {
    console.error("Error completing task:", error);
    next(new ErrorHandler("An error occurred while completing the task", 500));
  }
})

export const completeScratchCard = catchAsyncError(async (req, res, next) => {
  try {
    const { scratchId } = req.body;
    const userId = req.user;

    const scratchCard = await ScratchCard.findById(scratchId);
    if (!scratchCard) {
      return next(new ErrorHandler("Scratch Card not found", 404));
    }

    const isScratchCardCompleted = Array.isArray(scratchCard.completedBy) && scratchCard.completedBy.includes(userId);
    if (isScratchCardCompleted) {
      return next(new ErrorHandler("Scratch Card already completed", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    user.walletPoints += scratchCard.points;

    scratchCard.completedBy = Array.isArray(scratchCard.completedBy) ? scratchCard.completedBy : [];
    scratchCard.completedBy.push(userId);

    await user.save();
    await scratchCard.save();

    res.status(200).json({
      success: true,
      message: "Scratch Card completed successfully"
    });
  } catch (error) {
    console.error("Error completing Scratch Card:", error);
    next(new ErrorHandler("An error occurred while completing the task", 500));
  }
})


export const getCarousal = catchAsyncError(async (req, res, next) => {
  const carousal = await Carousel.find().select("url").sort("-createdAt");
  const baseUrl = `${req.protocol}://${req.get('host')}/`;
  const updatedCarousal = carousal.map(item => ({
    id: item._id,
    url: `${baseUrl}${item.url}`
  }));
  res.status(200).json({
    success: true,
    carousal: updatedCarousal,
  });
});