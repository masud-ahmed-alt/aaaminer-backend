import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  country: String,
  email: { type: String, unique: true },
  phone: String,
  password: { type: String, required: true, select: false },
  walletPoints: { type: Number, default: 0 },
  wallet: { type: Number, default: 0 },
  profilePic: String,
  emailOTP: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  isverified: { type: Boolean, required: true, default: false },
  isBanned: { type: Boolean, required: true, default: false },
  freeSpinLimit: { type: Number, default: 3 },
  dailySpinLimit: { type: Number, default: 17 },
  inreview: { type: Boolean, default: false },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, {
  timestamps: true
}
);

// Add indexes for frequently queried fields
// Note: email index is already created by unique: true above
userSchema.index({ username: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ isverified: 1 });
userSchema.index({ inreview: 1 });
userSchema.index({ walletPoints: -1 }); // For leaderboard queries
userSchema.index({ referredBy: 1 }); // For referral queries
userSchema.index({ createdAt: -1 }); // For user growth queries

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
