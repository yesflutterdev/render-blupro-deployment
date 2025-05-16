const mongoose = require('mongoose');

const appContentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['help', 'privacy'],
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('AppContent', appContentSchema);
