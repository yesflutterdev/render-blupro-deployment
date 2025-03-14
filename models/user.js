const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true,
    },
    email: {
        required: true,
        type: String,
        trim: true,
        validate: {
            validator: (value) => {
                const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return value.match(re)
            },
            message: "Please enter a valid email address",
        },
    },
    password: {
        required: true,
        type: String,
    },
    imageUrl: {
        type: String,
    },
    // bluGems
    totalGems: { type: Number, default: 0 },
    dailyCheckInCount: { type: Number, default: 0 }, //  lifetime check ins
    lastCheckInDate: { type: String, default: null },
    lastActivityDate: { type: String, default: null },
    dailyLikes: { type: Number, default: 0 },
    dailyComments: { type: Number, default: 0 },
    hasWatchedVideoToday: { type: Boolean, default: false },
    lastChatDate: { type: String, default: null }
});

const User = mongoose.model("User", userSchema);

module.exports = User;