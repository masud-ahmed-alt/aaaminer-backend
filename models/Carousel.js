import mongoose from 'mongoose';

const carousalSchema = new mongoose.Schema({
  url: String,
},{
    timestamps:true
});

export default mongoose.model('carousal', carousalSchema);