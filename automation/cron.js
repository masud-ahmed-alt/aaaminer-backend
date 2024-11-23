import cron from 'node-cron';
import { generateDailyTasks } from '../controllers/taskController.js';


export const taskCron = () => {
  cron.schedule('0 5 * * *', generateDailyTasks, {
    timezone: "Asia/Kolkata",
  });
};


