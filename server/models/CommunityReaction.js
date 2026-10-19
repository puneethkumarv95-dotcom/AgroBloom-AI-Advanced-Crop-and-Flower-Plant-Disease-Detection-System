const mongoose = require('mongoose');

const communityReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetType: {
      type: String,
      enum: ['post', 'comment'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    reactionType: {
      type: String,
      enum: ['helpful', 'upvote'],
      default: 'helpful'
    }
  },
  { timestamps: true }
);

// Enforce strictly one reaction per user per target
communityReactionSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('CommunityReaction', communityReactionSchema);

