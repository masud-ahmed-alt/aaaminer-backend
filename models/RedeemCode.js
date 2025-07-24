import mongoose from "mongoose";

const RedeemCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
     type: {
      type: String,
      required: true,
    },
    is_used: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RedeemCodes", RedeemCodeSchema);
