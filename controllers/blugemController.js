const User = require("../models/user");
const express = require("express");
const mongoose = require("mongoose");

const isNewDay = async (user) => {
    const today = new Date().toISOString().split("T")[0];
    
    if (user.lastActivityDate !== today) {
        user.lastActivityDate = today;
        user.dailyLikes = 0;
        user.dailyComments = 0;
        user.hasWatchedVideoToday = false;
        await user.save();
    }
    return user;
};

exports.dailyCheckIn = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
    }

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toISOString().split("T")[0];
    if (user.lastCheckInDate === today) {
        return res.json({ message: "Already checked in today! Come back tomorrow.", totalGems: user.totalGems });
    }

    user.lastCheckInDate = today;
    user.totalGems += 60;
    user.dailyCheckInCount += 1;
    await user.save();
    return res.status(200).json({ message: "Check-in successful! +60 Gems awarded", totalGems: user.totalGems });
};

exports.likePost = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
    }
    
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user = await isNewDay(user);

    if (user.dailyLikes < 3) {
        user.totalGems += 10;
        user.dailyLikes += 1;
        await user.save();
        return res.status(200).json({ message: "Like registered! +10 Gems awarded", totalGems: user.totalGems });
    }
    res.json({ message: "Like limit reached for today!" });
};

exports.commentPost = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
    }
    
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user = await isNewDay(user);

    if (user.dailyComments < 3) {
        user.totalGems += 20;
        user.dailyComments += 1;
        await user.save();
        return res.status(200).json({ message: "Comment registered! +20 Gems awarded", totalGems: user.totalGems });
    }
    res.json({ message: "Comment limit reached for today!" });
};

exports.watchVideo = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
    }
    
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user = await isNewDay(user);

    if (!user.hasWatchedVideoToday) {
        user.totalGems += 50;
        user.hasWatchedVideoToday = true;
        await user.save();
        return res.status(200).json({ message: "Video watched! +50 Gems awarded", totalGems: user.totalGems });
    }
    res.json({ message: "Already watched a video today!" });
};

exports.chatWithBluAgent = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID format" });
    }
    
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toISOString().split("T")[0];
    const lastChatDate = user.lastChatDate ? new Date(user.lastChatDate).toISOString().split("T")[0] : null;
    const isNewWeek = !lastChatDate || new Date(today).getTime() - new Date(lastChatDate).getTime() >= 7 * 24 * 60 * 60 * 1000;

    if (isNewWeek) {
        user.totalGems += 50;
        user.lastChatDate = today;
        await user.save();
        return res.status(200).json({ message: "Chat registered! +50 Gems awarded", totalGems: user.totalGems });
    }
    res.json({ message: "Weekly chat reward already claimed!" });
};

exports.getUserGems = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ userId, totalGems: user.totalGems, lifetimeCheckIns: user.dailyCheckInCount });
};
