const mongoose = require("mongoose");

const feedCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const FeedCategory = mongoose.model("FeedCategory", feedCategorySchema);
module.exports = FeedCategory;
