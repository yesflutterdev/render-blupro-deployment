const mongoose = require("mongoose");

const learnCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const LearnCategory = mongoose.model("LearnCategory", learnCategorySchema);
module.exports = LearnCategory;
