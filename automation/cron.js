import cron from 'node-cron';
import { scanUser } from '../controllers/adminController.js';
import { generateDailyTasks, generateScratchCard } from '../controllers/taskController.js';
import { resetSpinLimits } from '../utils/features.js';


export const taskCron = () => {
  cron.schedule('0 */2 * * *', generateDailyTasks, {
    timezone: "Asia/Kolkata",
  });
};

export const scratchCardCron = () => {
  cron.schedule('0 */5 * * *', generateScratchCard, {
    timezone: "Asia/Kolkata",
  });
};

export const usersScanning = () => {
  cron.schedule('0 0 * * *', scanUser, {
    timezone: "Asia/Kolkata",
  });
};

// Reset daily and free spin limits at midnight
export const resetSpinLimitsCron = () => {
  cron.schedule('0 0 * * *', resetSpinLimits, {
    timezone: "Asia/Kolkata",
  });
};