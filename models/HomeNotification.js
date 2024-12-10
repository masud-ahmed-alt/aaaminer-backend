import mongoose from 'mongoose';

const homeNotificationSchema = new mongoose.Schema({
  title: String,
},{
  timestamps:true
});

export default mongoose.model('homeNotification', homeNotificationSchema);