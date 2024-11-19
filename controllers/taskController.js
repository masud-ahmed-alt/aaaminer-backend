import Task from '../models/Task.js';
import User from '../models/User.js';

export const generateDailyTasks = async () => {
  await Task.deleteMany({}); // Delete previous tasks
  const tasks = Array.from({ length: 10 }, (_, i) => ({
    taskName: `Task ${i + 1}`,
    rewardPoints: Math.floor(Math.random() * 50) + 10,
  }));
  await Task.insertMany(tasks);
};

export const completeTask = async (req, res) => {
  const { userId, taskId } = req.body;
  const task = await Task.findById(taskId);

  if (!task) return res.status(404).json({ message: 'Task not found' });

  const user = await User.findById(userId);
  user.walletPoints += task.rewardPoints;
  await user.save();
  res.status(200).json({ message: 'Task completed', walletPoints: user.walletPoints });
};
