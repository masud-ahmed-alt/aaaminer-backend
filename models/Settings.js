import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Task settings
  taskCount: { type: Number, default: 10, min: 1, max: 100 },
  taskMinPoints: { type: Number, default: 40, min: 1 },
  taskMaxPoints: { type: Number, default: 65, min: 1 },
  
  // Scratch card settings
  scratchCardCount: { type: Number, default: 4, min: 1, max: 20 },
  scratchCardMinPoints: { type: Number, default: 30, min: 1 },
  scratchCardMaxPoints: { type: Number, default: 40, min: 1 },
  
  // Redeem settings
  redeemPaused: { type: Boolean, default: true },
  minRedeemAmountIndia: { type: Number, default: 100000, min: 1 },
  minRedeemAmountOther: { type: Number, default: 500000, min: 1 },
  redeemAmountsIndia: { type: [Number], default: [10000, 20000, 30000, 50000, 80000, 100000, 150000, 200000] },
  redeemAmountsOther: { type: [Number], default: [500000, 1000000, 1500000] },
  
  // App version settings (for Flutter migration)
  androidMinVersion: { type: String, default: "3.1.3" },
  androidMinVersionCode: { type: Number, default: 31 },
  flutterMinVersion: { type: String, default: "1.0.0" },
  flutterMinVersionCode: { type: Number, default: 1 },
  forceUpdateAndroid: { type: Boolean, default: false },
  forceUpdateFlutter: { type: Boolean, default: false },
  updateMessage: { type: String, default: "A new version is available. Please update to continue." },
  updateUrlAndroid: { type: String, default: "" },
  updateUrlFlutter: { type: String, default: "" },
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);

