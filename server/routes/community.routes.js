const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const CommunityReaction = require('../models/CommunityReaction');
const ContentReport = require('../models/ContentReport');
const Notification = require('../models/Notification');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Helper to notify user without throwing
const safeNotify = async (notificationData) => {
  try {
    if (notificationData.user) {
      await Notification.create(notificationData);
    }
  } catch (err) {
    console.warn('[Notification Trigger Warning]:', err.message);
  }
};

// GET /api/community/posts
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { category, search, plantType, sort = 'newest', page = 1, limit = 15 } = req.query;
    let query = { status: { $ne: 'hidden' } };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (plantType && plantType !== 'All') {
      query.plantType = plantType;
    }
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } },
        { diseaseTag: { $regex: term, $options: 'i' } }
      ];
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'helpful' || sort === 'most_helpful') {
      sortOptions = { helpfulCount: -1, createdAt: -1 };
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 15, 1), 50);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email role avatar farmLocation')
        .populate('comments.user', 'name role avatar')
        .populate('detectionRef', 'plantName primaryDisease condition confidence originalImageUrl')
        .sort(sortOptions)
        .skip(skip)
        .limit(parsedLimit),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: posts.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit) || 1,
      posts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts
router.post('/posts', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, plantType, diseaseTag, detectionRef } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Discussion title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Discussion description is required' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create({
      author: req.user._id,
      title: title.trim(),
      content: content.trim(),
      category: category || 'General Discussion',
      plantType: plantType || '',
      diseaseTag: diseaseTag || '',
      imageUrl,
      detectionRef: detectionRef || null
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email role avatar farmLocation')
      .populate('detectionRef');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/community/posts/:id
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email role avatar farmLocation')
      .populate('comments.user', 'name role avatar')
      .populate('detectionRef');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Discussion post not found' });
    }

    if (post.status === 'hidden' && (!req.user || !['admin', 'moderator'].includes(req.user.role))) {
      return res.status(403).json({ success: false, message: 'This post has been hidden by moderators' });
    }

    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/community/posts/:id
router.patch('/posts/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Only author or admin/moderator can edit
    if (post.author.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { title, content, category, plantType, diseaseTag } = req.body;
    if (title) post.title = title.trim();
    if (content) post.content = content.trim();
    if (category) post.category = category;
    if (plantType !== undefined) post.plantType = plantType;
    if (diseaseTag !== undefined) post.diseaseTag = diseaseTag;

    await post.save();

    const populated = await Post.findById(post._id)
      .populate('author', 'name role avatar')
      .populate('comments.user', 'name role');

    res.json({ success: true, post: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Only author or moderator/admin can delete
    if (post.author.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    // Also remove associated reactions
    await CommunityReaction.deleteMany({ targetType: 'post', targetId: post._id });

    res.json({ success: true, message: 'Post removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', protect, async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      parentCommentId: parentCommentId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Trigger notification to post author (if not self)
    if (post.author.toString() !== req.user._id.toString()) {
      await safeNotify({
        user: post.author,
        title: 'New Reply on Your Forum Post',
        message: `${req.user.name} commented on "${post.title.substring(0, 40)}..."`,
        type: 'system',
        priority: 'medium',
        link: `/forum?postId=${post._id}`
      });
    }

    // If this is a reply to another comment, notify that comment author
    if (parentCommentId) {
      const parentComment = post.comments.id(parentCommentId);
      if (parentComment && parentComment.user.toString() !== req.user._id.toString() && parentComment.user.toString() !== post.author.toString()) {
        await safeNotify({
          user: parentComment.user,
          title: 'Reply to Your Forum Comment',
          message: `${req.user.name} replied to your comment on "${post.title.substring(0, 40)}..."`,
          type: 'system',
          priority: 'medium',
          link: `/forum?postId=${post._id}`
        });
      }
    }

    const updated = await Post.findById(post._id)
      .populate('author', 'name role')
      .populate('comments.user', 'name role avatar');

    res.status(201).json({ success: true, comments: updated.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/community/comments/:id
router.patch('/comments/:id', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty' });
    }

    const post = await Post.findOne({ 'comments._id': req.params.id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const comment = post.comments.id(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this comment' });
    }

    comment.text = text.trim();
    comment.isEdited = true;
    comment.updatedAt = new Date();
    await post.save();

    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/community/comments/:id
router.delete('/comments/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOne({ 'comments._id': req.params.id });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const comment = post.comments.id(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Comment author, post author, or moderator/admin can delete
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();
    const isStaff = ['admin', 'moderator'].includes(req.user.role);

    if (!isCommentAuthor && !isPostAuthor && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts/:id/upvote
router.post('/posts/:id/upvote', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const index = post.upvotes.indexOf(req.user._id);
    let reacted = false;
    if (index === -1) {
      post.upvotes.push(req.user._id);
      reacted = true;
    } else {
      post.upvotes.splice(index, 1);
      reacted = false;
    }
    post.helpfulCount = post.upvotes.length;
    await post.save();

    // Also sync with CommunityReaction record
    if (reacted) {
      await CommunityReaction.findOneAndUpdate(
        { user: req.user._id, targetType: 'post', targetId: post._id },
        { reactionType: 'helpful' },
        { upsert: true }
      );
    } else {
      await CommunityReaction.findOneAndDelete({
        user: req.user._id,
        targetType: 'post',
        targetId: post._id
      });
    }

    res.json({
      success: true,
      upvotesCount: post.upvotes.length,
      helpfulCount: post.helpfulCount,
      reacted
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/reactions (Unified target reaction)
router.post('/reactions', protect, async (req, res) => {
  try {
    const { targetType, targetId, reactionType = 'helpful' } = req.body;
    if (!['post', 'comment'].includes(targetType) || !targetId) {
      return res.status(400).json({ success: false, message: 'Valid targetType and targetId required' });
    }

    const existing = await CommunityReaction.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    if (existing) {
      // Remove reaction
      await existing.deleteOne();
      if (targetType === 'post') {
        const post = await Post.findById(targetId);
        if (post) {
          post.upvotes = post.upvotes.filter(id => id.toString() !== req.user._id.toString());
          post.helpfulCount = Math.max(0, post.helpfulCount - 1);
          await post.save();
        }
      }
      return res.json({ success: true, reacted: false, message: 'Reaction removed' });
    } else {
      // Create reaction
      await CommunityReaction.create({
        user: req.user._id,
        targetType,
        targetId,
        reactionType
      });

      if (targetType === 'post') {
        const post = await Post.findById(targetId);
        if (post) {
          if (!post.upvotes.includes(req.user._id)) {
            post.upvotes.push(req.user._id);
          }
          post.helpfulCount = post.upvotes.length;
          await post.save();
        }
      }

      return res.status(201).json({ success: true, reacted: true, message: 'Reaction recorded' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/community/posts/:id/solve
router.patch('/posts/:id/solve', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'expert'
    ) {
      return res.status(403).json({ success: false, message: 'Only author or expert agronomist can mark discussion solved' });
    }
    post.isSolved = !post.isSolved;
    await post.save();
    res.json({ success: true, isSolved: post.isSolved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/community/posts/:id/accept-answer/:commentId
router.patch('/posts/:id/accept-answer/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Only post author or admin can accept an answer
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the question author can accept an answer' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Target comment not found on this post' });
    }

    // Toggle acceptance
    const wasAccepted = comment.isAccepted;
    post.comments.forEach(c => { c.isAccepted = false; });
    comment.isAccepted = !wasAccepted;
    post.acceptedAnswer = !wasAccepted ? comment._id : null;
    post.isSolved = !wasAccepted;
    await post.save();

    if (!wasAccepted && comment.user.toString() !== req.user._id.toString()) {
      await safeNotify({
        user: comment.user,
        title: 'Your Answer Was Accepted!',
        message: `${req.user.name} marked your solution as the accepted answer for "${post.title.substring(0, 35)}..."`,
        type: 'system',
        priority: 'high',
        link: `/forum?postId=${post._id}`
      });
    }

    res.json({
      success: true,
      acceptedAnswerId: post.acceptedAnswer,
      isSolved: post.isSolved
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/reports
router.post('/reports', protect, async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!['post', 'comment', 'consultation'].includes(targetType) || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'targetType, targetId, and reason are required' });
    }

    const report = await ContentReport.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details: details || ''
    });

    if (targetType === 'post') {
      await Post.findByIdAndUpdate(targetId, { $inc: { reportCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted to agricultural moderators for review',
      reportId: report._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
