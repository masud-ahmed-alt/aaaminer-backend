import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  adminCode: String,
  adminName:String
},{
  timestamps:true
});

export default mongoose.model('Admin', adminSchema);
