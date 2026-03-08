const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
    {
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
            maxlength: 2000,
        },
        mood: {
            type: String,
            default: '',
            trim: true,
            maxlength: 64,
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

module.exports = mongoose.model('Post', PostSchema);
