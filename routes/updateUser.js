const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const router = express.Router();


router.put("/user/update", async (req, res) => {
    try {
        const { userId, name, email } = req.body;

        if (!userId) return res.status(400).json({ message: "User ID is required" });

        const existingUser = await User.findById(userId);
        if (!existingUser) return res.status(404).json({ message: "User not found" });

        if (!name && !email) {
            return res.status(400).json({ message: "At least one field (name or email) must be provided" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name: name || existingUser.name,
                email: email || existingUser.email
            },
            { new: true }
        );

        res.json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


router.put("/user/update-image", async (req, res) => {
    try {
        const { userId, imageUrl } = req.body;

        if (!userId || !imageUrl) {
            return res.status(400).json({ message: "User ID and imageUrl are required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { imageUrl },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User image updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ================== Update Password ==================
router.put("/user/change-password", async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ message: "User ID, old password, and new password are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.put("/user/update-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// PUT /update-notification-key/:userId
router.put('/user/update-notification-key/:userId', async (req, res) => {
    console.log("--> inside update-notification-key")
    const { userId } = req.params;
    const { notificationKey } = req.body;

    if (!notificationKey) {
        return res.status(400).json({ error: 'Notification key is required' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { notificationKey },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Notification key updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
