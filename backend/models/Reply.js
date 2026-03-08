const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
            default: 'anonymous-device',
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1200,
        },
        moderation: {
            flagged: { type: Boolean, default: false },
            categories: {
                type: [String],
                default: [],
            },
            empatheticResponse: {
                type: String,
                default: '',
            },
            supportResources: {
                type: [String],
                default: [],
            },
            reviewed: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Reply', ReplySchema);
