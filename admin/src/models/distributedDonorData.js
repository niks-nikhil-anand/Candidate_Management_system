import mongoose from "mongoose";

const distributedDonorDataSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    donorData: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DonorData",
      }
    ],
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DistributedDonorData ||
  mongoose.model("DistributedDonorData", distributedDonorDataSchema);
