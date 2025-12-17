import mongoose from 'mongoose';

const carousalSchema = new mongoose.Schema(
  {
    // For older records this is a relative path like "uploads/carousal/filename.jpg"
    // For new records stored in Cloudinary this will be an absolute URL
    url: String,
    // Optional Cloudinary public ID used for deleting assets from Cloudinary
    publicId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("carousal", carousalSchema);