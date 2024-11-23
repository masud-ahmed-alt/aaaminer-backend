import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskName: String,
  rewardPoints: Number,
  completedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Task', taskSchema);
