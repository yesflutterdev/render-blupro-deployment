const express = require('express');
const router = express.Router();
const Feed = require('../models/feed');
const FeedCategory = require('../models/feedCategory');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /feed:
 *   get:
 *     summary: Get all feed posts
 *     tags: [Feed]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of feed posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feed'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/feed',  async (req, res) => {
    console.log('Inside /feed route');
    try {
        const feeds = await Feed.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name image')
            .populate('likes', 'name email')
            .populate('comments.userId', 'name email image');
        res.json(feeds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/feed/addFeed', async (req, res) => {
    try {
        const { title, description,tags, category, media, isVideo,userId } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({ message: 'Title, description, and category are required' });
        }

        const newFeed = new Feed({
            author: userId,
            title,
            description,
            category,
            media,
            tags,
            isVideo
        });

        await newFeed.save();

        res.json({ message: 'Feed added successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

router.delete('/feed/deleteFeed/:id', async (req, res) => {
    try {
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            return res.status(404).json({ message: 'feed not found' });
        }

        await feed.remove();
        res.json({ message: 'feed deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
); 

/// filter by feed category
router.get('/feed/filterByCategory', async (req, res) => {
    console.log('Inside /feed route');

    try {
        const { category } = req.query; 
        let query = {};

        if (category && category.toLowerCase() !== "all") {
            query.category = category; 
        }

        const feeds = await Feed.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'name image')
            .populate('likes', 'name email')
            .populate('comments.userId', 'name email image');

        res.json(feeds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/feed/:id', async (req, res) => {
    try {
        const feed = await Feed.findById(req.params.id)
            .populate('author', 'name image')
            .populate('likes', 'name email')
            .populate('comments.userId', 'name email image');
        res.json(feed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);


/**
 * @swagger
 * /feed/likeDislike:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Feed]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - postId
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID
 *               postId:
 *                 type: string
 *                 description: Post ID
 *     responses:
 *       200:
 *         description: Like/unlike successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isSuccess:
 *                   type: boolean
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/likeDislikeFeed', async (req, res) => {
    try {
        const { id, postId } = req.body;
        if (!id || !postId) {
            return res.status(400).json({ message: 'User ID and Post ID are required' });
        }

        const post = await Feed.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(id);
        if (likeIndex > -1) {
            
            post.likes.splice(likeIndex, 1);
        } else {
            
            post.likes.push(id);
        }

        await post.save();
        res.json({ isSuccess: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /feed/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Feed]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     $ref: '#/components/schemas/User'
 *                   text:
 *                     type: string
 *                   userName:
 *                     type: string
 *                   userImage:
 *                     type: string
 *       400:
 *         description: Post ID is required
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/comments', async (req, res) => {
    try {
        const { postId } = req.query;
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        const post = await Feed.findById(postId)
            .populate('comments.userId', 'name email image');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /feed/addComment:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Feed]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - postId
 *               - text
 *               - userName
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID
 *               postId:
 *                 type: string
 *                 description: Post ID
 *               text:
 *                 type: string
 *                 description: Comment text
 *               userName:
 *                 type: string
 *                 description: Name of the commenter
 *               userImage:
 *                 type: string
 *                 description: Profile image of the commenter
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       400:
 *         description: Required fields missing
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/addComment', async (req, res) => {
    try {
        const { id, postId, text, userName, userImage } = req.body;
        if (!id || !postId || !text || !userName) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const post = await Feed.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            userId: id,
            text,
            userName,
            userImage
        });

        await post.save();
        res.json({ message: 'Comment added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/feed/feedCategories", async (req, res) => {
    try {
      const categories = await FeedCategory.find().sort({ createdAt: -1 });
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories", error });
    }
  });

module.exports = router; 