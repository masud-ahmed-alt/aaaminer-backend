import cron from 'node-cron';
import { generateDailyTasks } from '../controllers/taskController.js';


export const taskCron = () => {
  cron.schedule('0 */4 * * *', generateDailyTasks, {
    timezone: "Asia/Kolkata",
  });
};



// export const taskCron = () => {
//   cron.schedule('*/30 * * * * *', generateDailyTasks, {
//     timezone: "Asia/Kolkata",
//   });
// };
