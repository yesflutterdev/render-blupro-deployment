const express = require('express');
const router = express.Router();
const Stream = require('../models/stream');

router.get('/stream/fetchStreams',  async (req, res) => {
  
    try {
        const streams = await Stream.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name image');
            // TODO: when inclute like and comments
            // .populate('likes', 'name email')
            // .populate('comments.userId', 'name email image');
        res.json(streams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/stream/likeDislikeStream', async (req, res) => {
    try {
        const { id, streamId } = req.body;
        if (!id || !streamId) {
            return res.status(400).json({ message: 'User ID and Stream ID are required' });
        }

        const stream = await Stream.findById(streamId);
        if (!stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }

        const likeIndex = stream.likes.indexOf(id);
        if (likeIndex > -1) {
            stream.likes.splice(likeIndex, 1);
        } else {
            stream.likes.push(id);
        }

        await stream.save();
        res.json({ isSuccess: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;