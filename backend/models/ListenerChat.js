const mongoose = require('mongoose');

const ListenerChatSchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        listenerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listener',
            required: true,
            index: true,
        },
        senderRole: {
            type: String,
            enum: ['user', 'listener', 'system'],
            required: true,
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
        },
    },
    {
        timestamps: true,
    }
);

ListenerChatSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('ListenerChat', ListenerChatSchema);
