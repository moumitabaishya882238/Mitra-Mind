const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: String,
            required: true,
            index: true,
            default: 'anonymous-device',
        },
        receiverId: {
            type: String,
            required: true,
            index: true,
        },
        conversationId: {
            type: String,
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
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

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);
