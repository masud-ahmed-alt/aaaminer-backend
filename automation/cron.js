import cron from 'node-cron';
import { generateDailyTasks } from '../controllers/taskController.js';

cron.schedule('0 5 * * *', generateDailyTasks, {
  timezone: "Asia/Kolkata",
});
