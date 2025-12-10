import mongoose from 'mongoose';

const scratchCardSchema = new mongoose.Schema({
  points: Number,
  desc: String,
  completedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for performance
scratchCardSchema.index({ completedBy: 1 });
scratchCardSchema.index({ createdAt: -1 });

export default mongoose.model('ScratchCard', scratchCardSchema);
