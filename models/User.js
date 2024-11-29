import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: { type: String, unique: true },
  dob: Date,
  gender: String,
  phone: String,
  password: { type: String, required: true, select: false },
  walletPoints: { type: Number, default: 0 },
  wallet: { type: Number, default: 0 },
  profilePic: String,
  isverified: { type: Boolean, required: true, default: false },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, {
  timestamps: true
}
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
