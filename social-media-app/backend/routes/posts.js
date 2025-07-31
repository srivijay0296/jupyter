const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, [
  body('content')
    .notEmpty()
    .withMessage('Post content is required')
    .isLength({ max: 280 })
    .withMessage('Post content cannot exceed 280 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, media, location, visibility = 'public', replyTo } = req.body;

    const post = new Post({
      content,
      author: req.user.id,
      media,
      location,
      visibility,
      isReply: !!replyTo,
      replyTo
    });

    await post.save();
    
    // Populate author information
    await post.populate('author', 'username fullName profilePicture isVerified');
    
    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: post._id }
    });

    // Emit real-time notification
    const io = req.app.get('io');
    io.emit('post-created', {
      post: post,
      author: post.author
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// @route   GET /api/posts
// @desc    Get feed posts
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { isDeleted: false };
    
    // If user is authenticated, show posts from followed users + public posts
    if (req.user) {
      const user = await User.findById(req.user.id);
      query = {
        $or: [
          { author: { $in: [...user.following, req.user.id] } },
          { visibility: 'public' }
        ],
        isDeleted: false
      };
    } else {
      query.visibility = 'public';
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName profilePicture isVerified')
      .populate('originalPost')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture isVerified'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add engagement data for authenticated users
    const postsWithEngagement = req.user 
      ? posts.map(post => post.getEngagementData(req.user.id))
      : posts;

    res.json({
      posts: postsWithEngagement,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error getting posts' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName profilePicture isVerified')
      .populate('originalPost')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture isVerified'
        }
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture isVerified'
        },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    await post.incrementViews();

    const postWithEngagement = req.user 
      ? post.getEngagementData(req.user.id)
      : post.toObject();

    res.json({ post: postWithEngagement });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error getting post' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.isLikedBy(req.user.id);
    
    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(like => 
        like.user.toString() !== req.user.id.toString()
      );
      
      // Remove from user's liked posts
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { likedPosts: post._id }
      });
    } else {
      // Like the post
      post.likes.push({ user: req.user.id });
      
      // Add to user's liked posts
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { likedPosts: post._id }
      });

      // Send real-time notification
      if (post.author.toString() !== req.user.id.toString()) {
        const io = req.app.get('io');
        io.emit('post-liked', {
          postId: post._id,
          postAuthorId: post.author,
          username: req.user.username
        });
      }
    }

    await post.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likesCount: post.likesCount
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error liking post' });
  }
});

// @route   POST /api/posts/:id/retweet
// @desc    Retweet a post
// @access  Private
router.post('/:id/retweet', auth, [
  body('comment')
    .optional()
    .isLength({ max: 280 })
    .withMessage('Retweet comment cannot exceed 280 characters')
], async (req, res) => {
  try {
    const { comment = '' } = req.body;
    const originalPost = await Post.findById(req.params.id);
    
    if (!originalPost || originalPost.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already retweeted
    const isRetweeted = originalPost.isRetweetedBy(req.user.id);
    
    if (isRetweeted) {
      return res.status(400).json({ message: 'You have already retweeted this post' });
    }

    // Create retweet
    const retweet = new Post({
      content: comment,
      author: req.user.id,
      isRetweet: true,
      originalPost: originalPost._id,
      retweetComment: comment
    });

    await retweet.save();
    
    // Add retweet to original post
    originalPost.retweets.push({ user: req.user.id, comment });
    await originalPost.save();
    
    // Add to user's posts and retweeted posts
    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: retweet._id, retweetedPosts: originalPost._id }
    });

    // Populate for response
    await retweet.populate([
      { path: 'author', select: 'username fullName profilePicture isVerified' },
      { 
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username fullName profilePicture isVerified'
        }
      }
    ]);

    res.status(201).json({
      message: 'Post retweeted successfully',
      retweet
    });
  } catch (error) {
    console.error('Retweet error:', error);
    res.status(500).json({ message: 'Server error retweeting post' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', auth, [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 280 })
    .withMessage('Comment cannot exceed 280 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, media, parentComment } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      post: post._id,
      parentComment,
      media
    });

    await comment.save();
    
    // Add comment to post
    post.comments.push(comment._id);
    await post.save();
    
    // If it's a reply to another comment, add to parent's replies
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    // Populate comment for response
    await comment.populate('author', 'username fullName profilePicture isVerified');

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Soft delete
    post.isDeleted = true;
    await post.save();

    // Remove from user's posts array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { posts: post._id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

module.exports = router;