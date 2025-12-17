import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskName: String,
  rewardPoints: Number,
  completedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for performance
taskSchema.index({ completedBy: 1 });
taskSchema.index({ createdAt: -1 });

export default mongoose.model('Task', taskSchema);
