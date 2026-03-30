const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/:username
// @desc    Get user profile
// @access  Public
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username fullName profilePicture isVerified')
      .populate('following', 'username fullName profilePicture isVerified');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ 
      author: user._id, 
      isDeleted: false 
    })
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
    .limit(20);

    // Add engagement data for authenticated users
    const postsWithEngagement = req.user 
      ? posts.map(post => post.getEngagementData(req.user.id))
      : posts;

    // Check if current user follows this user
    const isFollowing = req.user ? 
      user.followers.some(follower => follower._id.toString() === req.user.id.toString()) : 
      false;

    // Get public profile or full profile if it's the user's own profile
    const profile = req.user && req.user.id.toString() === user._id.toString() 
      ? user 
      : user.getPublicProfile();

    res.json({
      user: {
        ...profile,
        isFollowing
      },
      posts: postsWithEngagement
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error getting user profile' });
  }
});

// @route   POST /api/users/:userId/follow
// @desc    Follow/unfollow a user
// @access  Private
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(req.params.userId);
    
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.userId
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user.id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.user.id);

      // Send real-time notification
      const io = req.app.get('io');
      io.emit('user-followed', {
        followedUserId: req.params.userId,
        followerId: req.user.id,
        username: currentUser.username
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isFollowing,
      followersCount: userToFollow.followersCount
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error following user' });
  }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user's followers
// @access  Public
router.get('/:userId/followers', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'followers',
        select: 'username fullName profilePicture isVerified bio',
        options: { skip, limit }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add isFollowing field if user is authenticated
    let followers = user.followers;
    if (req.user) {
      const currentUser = await User.findById(req.user.id);
      followers = followers.map(follower => ({
        ...follower.toObject(),
        isFollowing: currentUser.following.includes(follower._id)
      }));
    }

    res.json({
      followers,
      pagination: {
        page,
        limit,
        hasMore: followers.length === limit
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error getting followers' });
  }
});

// @route   GET /api/users/:userId/following
// @desc    Get users that this user follows
// @access  Public
router.get('/:userId/following', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'following',
        select: 'username fullName profilePicture isVerified bio',
        options: { skip, limit }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add isFollowing field if user is authenticated
    let following = user.following;
    if (req.user) {
      const currentUser = await User.findById(req.user.id);
      following = following.map(followedUser => ({
        ...followedUser.toObject(),
        isFollowing: currentUser.following.includes(followedUser._id)
      }));
    }

    res.json({
      following,
      pagination: {
        page,
        limit,
        hasMore: following.length === limit
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error getting following' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username fullName profilePicture isVerified bio')
    .skip(skip)
    .limit(parseInt(limit));

    // Add isFollowing field if user is authenticated
    let searchResults = users;
    if (req.user) {
      const currentUser = await User.findById(req.user.id);
      searchResults = users.map(user => ({
        ...user.toObject(),
        isFollowing: currentUser.following.includes(user._id)
      }));
    }

    res.json({
      users: searchResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

// @route   GET /api/users/:userId/posts
// @desc    Get user's posts with pagination
// @access  Public
router.get('/:userId/posts', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type || 'all'; // all, posts, replies, media, likes

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = { author: req.params.userId, isDeleted: false };
    
    // Filter by post type
    switch (type) {
      case 'posts':
        query.isReply = false;
        query.isRetweet = false;
        break;
      case 'replies':
        query.isReply = true;
        break;
      case 'media':
        query.media = { $exists: true, $ne: [] };
        break;
      case 'likes':
        // Get liked posts
        const likedPosts = await Post.find({
          _id: { $in: user.likedPosts },
          isDeleted: false
        })
        .populate('author', 'username fullName profilePicture isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const likedPostsWithEngagement = req.user 
          ? likedPosts.map(post => post.getEngagementData(req.user.id))
          : likedPosts;

        return res.json({
          posts: likedPostsWithEngagement,
          pagination: {
            page,
            limit,
            hasMore: likedPosts.length === limit
          }
        });
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
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error getting user posts' });
  }
});

// @route   GET /api/users/suggestions
// @desc    Get suggested users to follow
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const limit = parseInt(req.query.limit) || 10;

    // Find users that current user is not following
    // and exclude current user
    const suggestions = await User.find({
      _id: { 
        $nin: [...currentUser.following, req.user.id] 
      }
    })
    .select('username fullName profilePicture isVerified bio')
    .sort({ followersCount: -1 }) // Sort by popularity
    .limit(limit);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error getting suggestions' });
  }
});

module.exports = router;