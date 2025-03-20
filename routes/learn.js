const express = require('express');
const router = express.Router();
const Learn = require('../models/learn');
const LearnCategory = require('../models/learnCategory');
const auth = require('../middleware/auth');


router.get('/learn',  async (req, res) => {
    console.log('Inside /learn route');
    try {
        const learns = await Learn.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name image')
            .populate('likes', 'name email')
            .populate('comments.userId', 'name email image');
        res.json(learns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/learn/addLearn', async (req, res) => {
    try {
        const { title, description,tags, category, media, isVideo,userId } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({ message: 'Title, description, and category are required' });
        }

        const newLearn = new Learn({
            author: userId,
            title,
            description,
            category,
            media,
            tags,
            isVideo
        });

        await newLearn.save();

        res.json({ message: 'Learn added successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);


/// filter by feed category
router.get('/learn/filterByCategory', async (req, res) => {
    

    try {
        const { category } = req.query; 
        let query = {};

        if (category && category.toLowerCase() !== "all") {
            query.category = category;
        }

        const learns = await Learn.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'name image')
            .populate('likes', 'name email')
            .populate('comments.userId', 'name email image');

        res.json(learns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/learn/:id', async (req, res) => {
    try {
        const learn = await Learn.findById(req.params.id)
            .populate('author', 'name image')
            .populate('likes', 'name email')
            .populate('comments.userId', 'name email image');
        res.json(learn);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

router.post('/learn/likeDislikeLearn', async (req, res) => {
    try {
        const { id, postId } = req.body;
        if (!id || !postId) {
            return res.status(400).json({ message: 'User ID and Post ID are required' });
        }

        const post = await Learn.findById(postId);
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


router.get('/learn/comments', async (req, res) => {
    try {
        const { postId } = req.query;
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        const post = await Learn.findById(postId)
            .populate('comments.userId', 'name email image');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/learn/addComment', async (req, res) => {
    try {
        const { id, postId, text, userName, userImage } = req.body;
        if (!id || !postId || !text || !userName) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const post = await Learn.findById(postId);
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

router.get("/learn/category/learnCategories", async (req, res) => {
    try {
      const categories = await LearnCategory.find().sort({ createdAt: -1 });
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories", error });
    }
  }); 

 router.delete('/learn/deleteLearn/:id', async (req, res) => {
    try {
        const learn = await Learn.findById(req.params.id);
        if (!learn) {
            return res.status(404).json({ message: 'Learn not found' });
        }

        await learn.remove();
        res.json({ message: 'Learn deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
); 

module.exports = router; 