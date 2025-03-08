const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  amount: Number,
  type: String, 
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

const userPointsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  points: { type: Number, default: 0 },
  transactions: [transactionSchema]
});

module.exports = mongoose.model("bluPoint", userPointsSchema);
