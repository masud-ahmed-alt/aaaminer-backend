import mongoose from 'mongoose';

const withdrawSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    redeemOption: { type: String, required: false },
    voucher: { type: String, required: false },
    upi_id: { type: String, required: false },
    amount: { type: Number, required: true },
    points: { type: Number, required: true },
    status: {
        type: String,
        enum: ["processing", "success", "rejected"],
        default: "processing"
    }
}, {
    timestamps: true
});

export default mongoose.model('Withdraw', withdrawSchema);
