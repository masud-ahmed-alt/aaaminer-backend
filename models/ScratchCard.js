import mongoose from 'mongoose';

const scratchCardSchema = new mongoose.Schema({
  points: Number,
  desc: String,
  completedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ScratchCard', scratchCardSchema);
