import cron from 'node-cron';
import { generateDailyTasks, generateScratchCard } from '../controllers/taskController.js';
import { usersEnquiry } from '../controllers/adminController.js';


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

export const usersValidation = () => {
  cron.schedule('0 0 * * *', usersEnquiry, {
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