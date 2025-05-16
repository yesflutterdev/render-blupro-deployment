const mongoose = require("mongoose");

const activityCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


const ActivityCategory = mongoose.model("ActivityCategory", activityCategorySchema);
module.exports = ActivityCategory;
