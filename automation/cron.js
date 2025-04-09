import cron from 'node-cron';
import { scanUser } from '../controllers/adminController.js';
import { generateDailyTasks, generateScratchCard } from '../controllers/taskController.js';


export const taskCron = () => {
  cron.schedule('0 */4 * * *', generateDailyTasks, {
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