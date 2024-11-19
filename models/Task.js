import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskName: String,
  rewardPoints: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Task', taskSchema);
