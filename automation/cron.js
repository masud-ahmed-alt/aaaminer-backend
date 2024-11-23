import cron from 'node-cron';
import { generateDailyTasks } from '../controllers/taskController.js';


export const taskCron = () => {
  cron.schedule('* * * * *', generateDailyTasks, {
    timezone: "Asia/Kolkata",
  });
};


