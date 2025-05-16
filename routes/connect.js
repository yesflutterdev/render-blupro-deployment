const express = require('express');
const router = express.Router();
const { Group, GroupPost } = require('../models/group');
const User = require('../models/user');
const mongoose = require("mongoose");

router.get('/group/allGroups', async (req, res) => {

    try {
        const groups = await Group.find()
            .populate('members', 'name email image')
            .select('-posts');

        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/group/groupMembers', async (req, res) => {
    try {
        const { groupId } = req.query;
        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }

        const group = await Group.findById(groupId)
            .populate('members', 'name email image')
            .select('members');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group.members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/group/groupPosts', async (req, res) => {
    try {
        const { groupId } = req.query;
        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }

        const group = await Group.findById(groupId).populate({
            path: 'posts',
            populate: [
                { path: 'createdBy', select: 'name email image' },
                { path: 'likes', select: 'name email' },
                { path: 'comments.userId', select: 'name email image' }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group.posts);
    } catch (error) {
        console.error('Error fetching group posts:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/group/createGroup', async (req, res) => {
    try {
        const { name, about, type, category, createdBy } = req.body;

        const group = new Group({
            name,
            about,
            type,
            category,
            members: [createdBy]
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/group/joinGroups/:groupId/join', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(200).json({ message: 'User ID is required' });
        }

        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(200).json({ message: 'Group not found' });
        }

        if (group.members.includes(userId)) {
            return res.status(200).json({ message: 'User is already a member' });
        }

        // private 
        if (group.type === 'private') {
            if (group.pendingApprovals.includes(userId)) {
                return res.status(200).json({ message: 'Join request already sent. Please wait for approval.' });
            }

            group.pendingApprovals.push(userId);
            await group.save();

            return res.json({ message: 'Join request sent. Awaiting admin approval.' });
        }

        // Public group: 
        group.members.push(userId);
        await group.save();

        res.json({ message: 'Joined group successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/group/leaveGroups/:groupId/leave', async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const memberIndex = group.members.indexOf(userId);
        if (memberIndex === -1) {
            return res.status(400).json({ message: 'User is not a member' });
        }

        group.members.splice(memberIndex, 1);
        await group.save();

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/group/groupPost/:groupId/createPost', async (req, res) => {
    try {
        const { title, description, media, isVideo, createdBy, autherName, autherImage, tags } = req.body;

        const group = await Group.findById(req.params.groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.includes(createdBy)) {
            return res.status(403).json({ message: 'Only members can post' });
        }

        const newPost = new GroupPost({
            title,
            description,
            media,
            isVideo,
            createdBy,
            autherName,
            autherImage,
            tags
        });

        await newPost.save();

        group.posts.unshift(newPost._id);
        await group.save();

        await User.findByIdAndUpdate(createdBy, {
            $push: {
                userPostedGroupPostIds: {
                    groupId: group._id,
                    groupName: group.name,
                    postId: newPost._id,
                    groupType: group.type
                }
            }
        });

        res.status(200).json({ message: 'Post created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// router.post('/group/likeDislikeGroupPost/:groupId/posts/:postId/like', async (req, res) => {
//     try {

//         const { userId } = req.body;


//         const group = await Group.findById(req.params.groupId);

//         if (!group) {
//             console.log("Group not found");
//             return res.status(404).json({ message: 'Group not found' });
//         }

//         console.log("Group found:", group);

//         const post = group.posts.id(req.params.postId);

//         if (!post) {
//             console.log(`Post with ID ${req.params.postId} not found in group ${req.params.groupId}`);
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const likeIndex = post.likes.indexOf(userId);
//         if (likeIndex > -1) {
//             post.likes.splice(likeIndex, 1);
//         } else {
//             post.likes.push(userId);
//         }

//         await group.save();
//         res.json({ message: 'Post like updated successfully' });
//     } catch (error) {
//         console.error("Error occurred:", error);
//         res.status(500).json({ message: error.message });
//     }
// });

router.post('/group/likeDislikeGroupPost/:groupId/posts/:postId/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const { groupId, postId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const post = await GroupPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (!group.posts.includes(postId)) {
            return res.status(400).json({ message: 'Post does not belong to this group' });
        }

        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ message: 'Post like status updated successfully' });

    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ message: error.message });
    }
});


// router.post('/group/commentGroupPost/:groupId/posts/:postId/comment', async (req, res) => {
//     try {
//         const { userId, text, userName, userImage } = req.body;
//         const group = await Group.findById(req.params.groupId);
//         console.log(req.params.groupId);

//         if (!group) {
//             return res.status(404).json({ message: 'Group not found' });
//         }

//         const post = group.posts.id(req.params.postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         post.comments.push({
//             userId,
//             text,
//             userName,
//             userImage
//         });

//         await group.save();
//         res.json({ message: 'Comment added successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

router.post('/group/commentGroupPost/:groupId/posts/:postId/comment', async (req, res) => {
    try {
        const { userId, text, userName, userImage } = req.body;

        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const postId = req.params.postId;
        if (!group.posts.includes(postId)) {
            return res.status(400).json({ message: 'Post does not belong to this group' });
        }

        const post = await GroupPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            userId,
            text,
            userName,
            userImage,
            createdAt: new Date(),
        });

        await post.save();

        res.json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: error.message });
    }
});


router.post('/group/users/getUsersByIds', async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds)) {
            return res.status(400).json({ message: 'userIds must be an array' });
        }

        const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));

        if (validUserIds.length === 0) {
            return res.status(400).json({ message: 'No valid user IDs provided' });
        }

        const users = await User.find({ _id: { $in: validUserIds } });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/connects/currentUserGroupPosts', async (req, res) => {
    try {
        const { userId } = req.query;

        // Check if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.userPostedGroupPostIds || user.userPostedGroupPostIds.length === 0) {
            return res.status(200).json({ posts: [] });
        }

        // Loop through each postId and get post with populated data
        const posts = await Promise.all(
            user.userPostedGroupPostIds.map(async (entry) => {
                const post = await GroupPost.findById(entry.postId)
                    .populate('createdBy', 'name email image')
                    .lean();

                if (!post) return null;

                return {
                    postId: entry.postId,
                    groupId: entry.groupId,
                    groupName: entry.groupName,
                    groupType: entry.groupType,
                    post,
                };
            })
        );

        // Filter out any nulls in case some posts are deleted
        const filteredPosts = posts.filter(Boolean);

        res.status(200).json(filteredPosts);

    } catch (error) {
        console.error('Error fetching user group posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE /group/groupPost/:groupId/deletePost/:postId?userId=yourUserId

router.delete('/group/groupPost/:groupId/deletePost/:postId', async (req, res) => {
    try {
        const { groupId, postId } = req.params;
        const { userId } = req.query;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(groupId) ||
            !mongoose.Types.ObjectId.isValid(postId) ||
            !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid IDs provided' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const post = await GroupPost.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Only creator of post can delete
        if (post.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        // Delete post from GroupPost collection
        await GroupPost.findByIdAndDelete(postId);

        // Remove post from group's posts array
        group.posts = group.posts.filter(id => id.toString() !== postId);
        await group.save();

        // Remove post from user's postedGroupPostIds
        await User.findByIdAndUpdate(userId, {
            $pull: {
                userPostedGroupPostIds: { postId: postId }
            }
        });

        res.status(200).json({ message: 'Post deleted successfully' });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/// update the post
router.put('/connects/updateGroupPost/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const existingPost = await GroupPost.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const updatedPost = await GroupPost.findByIdAndUpdate(
            postId,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
        console.error('Error updating group post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 