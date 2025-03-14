const express = require("express");
const {
  dailyCheckIn,
  likePost,
  commentPost,
  watchVideo,
  chatWithBluAgent,
  getUserGems,
} = require("../controllers/blugemController");

const router = express.Router();

router.post("/checkin", dailyCheckIn);
router.post("/like", likePost);
router.post("/comment", commentPost);
router.post("/watch-video", watchVideo);
router.post("/chat", chatWithBluAgent);
router.get("/gems", getUserGems);

module.exports = router;
