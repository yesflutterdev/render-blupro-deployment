const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const streamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
    },
    tags: {
        type: [String],
    },
    externalUrl: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    ingressId: {
        type: String,
    },
    serverUrl: {
        type: String,
    },
    streamKey: {
        type: String,
    },
    isLive: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

module.exports = mongoose.models.Stream || mongoose.model('Stream', streamSchema);
