const express = require("express");
const router = express.Router();
const UserPoints = require("../models/UserPoints");
const mongoose = require("mongoose");

router.get("/bluPoints/getBluPoints/:userId", async (req, res) => {
  try {
    console.log("bluPoints/getBluPoints/:userId")
    const { userId } = req.params;
    const userPoints = await UserPoints.findOne({ userId });

    if (!userPoints) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ userId, points: userPoints.points, transactions: userPoints.transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/bluPoints/add-points/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Valid amount is required", success: false });
    }

    let userPoints = await UserPoints.findOne({ userId });

    if (!userPoints) {
      userPoints = new UserPoints({ userId, points: 0, transactions: [] });
    }

    userPoints.points += amount;

    userPoints.transactions.push({
      amount,
      type: "credit",
      reason,
      createdAt: new Date()
    });

    await userPoints.save();
    res.json({ message: "Points added successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
});


router.post("/bluPoints/add-transaction/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type, reason } = req.body;

    if (!amount || isNaN(amount) || !["credit", "debit"].includes(type)) {
      return res.status(400).json({ message: "Invalid amount or transaction type",  success: false });
    }

    let userPoints = await UserPoints.findOne({ userId });

    if (!userPoints) {
      userPoints = new UserPoints({ userId, points: 0, transactions: [] });
    }

    if (type === "credit") {
      userPoints.points += amount;
    } else if (type === "debit") {
      if (userPoints.points < amount) {
        return res.status(400).json({ message: "Insufficient points", success: false });
      }
      userPoints.points -= amount;
    }

    userPoints.transactions.push({
      amount,
      type,
      reason,
      createdAt: new Date()
    });

    await userPoints.save();
    res.json({ message: "Transaction added successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" , success: false});
  }
});

module.exports = router;
