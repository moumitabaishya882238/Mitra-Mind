const mongoose = require('mongoose');

const SavedPostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
            default: 'anonymous-device',
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('SavedPost', SavedPostSchema);
