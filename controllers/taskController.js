import Task from '../models/Task.js';
import User from '../models/User.js';
import { getAvailableTasks } from '../utils/features.js';
import { ErrorHandler } from '../utils/utility.js';

export const getRanking = async (req, res, next) => {
  try {
    const userid = req.user;
    const { type } = req.query;

    if (!type) {
      return next(new ErrorHandler("Please select a type", 400));
    }

    let users;

    if (type === 'all') {
      users = await User.find().select("username walletPoints").sort({ walletPoints: -1 });
    } else if (type === 'friend') {
      users = await User.find({ referredBy: userid }).select("username walletPoints").sort({ walletPoints: -1 });
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Something went wrong", 500));
  }
};



export const generateDailyTasks = async () => {
  console.log("generateDailyTasks initiated");

  try {
    const deleteTask = await Task.deleteMany({}); // Delete previous tasks
    if (deleteTask)
      console.log("Task deleted");
  } catch (error) {
    console.log("Error while deleting: ", error);
  }

  try {
    const tasks = Array.from({ length: 10 }, (_, i) => ({
      taskName: `Task ${i + 1}`,
      rewardPoints: Math.floor(Math.random() * 900) + 100,
    }));
    await Task.insertMany(tasks);
  } catch (error) {
    console.log("Error while creating: ", error);
  }
};


export const getUserTasks = async (req, res, next) => {
  try {
    const userId = req.user;
    if (!userId) return next(new ErrorHandler('User ID is required', 400))
    const tasks = await getAvailableTasks(userId);
    if (!tasks || tasks.length === 0)
      return next(new ErrorHandler("Task not found! Please comeback after sometimes!", 404))
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeTask = async (req, res, next) => {
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
};

