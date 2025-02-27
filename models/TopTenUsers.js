import mongoose from 'mongoose';

const topTenUserSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

export default mongoose.model('TopTenUser', topTenUserSchema);