const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        required: false,
        type: String,
        trim: true,
    },
    notificationKey: {
        type: String,
        trim: true,
    },
    email: { // we don't need email, for now onward we are going to use bluId
        required: false,
        type: String,
        unique: false,
        trim: true,
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
    isAdmin: {
        type: Boolean,
        default: false
    },
    authToken: {
        type: String
    },
    bluId: {
        type: String, required: true, unique: true,
    }
    ,
    ///
    userPostedGroupPostIds: [
        {
            groupId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Group',
                required: true
            },
            groupName: {
                type: String,
                required: true
            },
            postId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'GroupPost',
                required: true
            },
            groupType: {
                type: String,
                enum: ['public', 'private'],
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;