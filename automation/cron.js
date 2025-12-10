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

// reset daily and free spin limits at 30 sec for testing purpose
export const resetSpinLimitsCron = () => {
  cron.schedule('0 0 * * *', resetSpinLimits, {
    timezone: "Asia/Kolkata",
  });
};



// export const resetSpinLimitsCron = () => {
//   cron.schedule('0 0 * * *', resetSpinLimits, {
//     timezone: "Asia/Kolkata",
//   });
// };



// export const taskCron = () => {
//   cron.schedule('*/30 * * * * *', generateDailyTasks, {
//     timezone: "Asia/Kolkata",
//   });
// }

// export const scratchCardCron = () => {
//   cron.schedule('*/40 * * * * *', generateScratchCard, {
//     timezone: "Asia/Kolkata",
//   });
// }