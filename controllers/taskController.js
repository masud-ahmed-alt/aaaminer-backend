import { catchAsyncError } from '../middlewares/errorMiddleware.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { getAvailableTasks } from '../utils/features.js';
import { ErrorHandler } from '../utils/utility.js';

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
      users = await User.find({ referredBy: userid, isverified:true })
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
  console.log("generateDailyTasks initiated");

  // Delete previous tasks
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

  // Create new tasks
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

    const tasks = Array.from({ length: 7 }, () => {
      const rewardPoints = Math.floor(Math.random() * 90) + 10; // Reward between 10 and 99
      const randomTemplate = taskNameTemplates[Math.floor(Math.random() * taskNameTemplates.length)];
      return {
        taskName: `${randomTemplate}`,
        rewardPoints,
      };
    });

    await Task.insertMany(tasks);
    console.log("Tasks created successfully");
  } catch (error) {
    console.log("Error while creating tasks: ", error.message || error);
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
