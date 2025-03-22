const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        required: false,
        type: String,
        trim: true,
    },
    email: { // we don't need email, for now onward we are going to use bluId
        required: false,
        type: String,
        unique: false,
        trim: true,
        // validate: {
        //     validator: (value) => {
        //         const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        //         return value.match(re)
        //     },
        //     message: "Please enter a valid email address",
        // },
    },
    password: {
        required: false,
        type: String,
    },
    imageUrl: {
        type: String,
        default: "",
    },
    // bluGems
    totalGems: { type: Number, default: 0 },
    dailyCheckInCount: { type: Number, default: 0 }, //  lifetime check ins
    lastCheckInDate: { type: String, default: null },
    lastActivityDate: { type: String, default: null },
    dailyLikes: { type: Number, default: 0 },
    dailyComments: { type: Number, default: 0 },
    hasWatchedVideoToday: { type: Boolean, default: false },
    lastChatDate: { type: String, default: null },
    isAdmin:{
        type: Boolean,
        default: false
    },
    authToken:{
        type: String
    },
    bluId:{
        type: String, required: true, unique: true,
    }
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;