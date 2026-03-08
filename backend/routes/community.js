const express = require('express');
const mongoose = require('mongoose');

const Post = require('../models/Post');
const Reply = require('../models/Reply');
const DirectMessage = require('../models/DirectMessage');
const SavedPost = require('../models/SavedPost');

const router = express.Router();

const SUPPORT_RESOURCES = [
    'India - Tele MANAS: 14416 / 1-800-891-4416',
    'USA & Canada - 988 Lifeline: Call or text 988',
    'UK & ROI - Samaritans: 116 123',
    'Global hotline directory: https://findahelpline.com',
];

const MODERATION_PATTERNS = {
    suicide_ideation: [
        'suicide',
        'kill myself',
        'end my life',
        'i want to die',
        'want to disappear',
        'marna chahta',
        'aatmahatya',
        'मरना चाहता',
        'आत्महत्या',
    ],
    self_harm: [
        'self harm',
        'self-harm',
        'cut myself',
        'hurt myself',
        'khud ko nuksan',
        'खुद को नुकसान',
    ],
    bullying_or_harassment: [
        'harass',
        'bully',
        'abuse',
        'worthless',
        'loser',
        'idiot',
        'hate you',
        'stupid',
    ],
};

function getAnonymousDisplayName(userId = 'anonymous-device') {
    // Deterministic pseudonym so identity stays anonymous while threads stay consistent.
    let hash = 0;
    const value = String(userId);
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }
    const suffix = String((Math.abs(hash) % 900) + 100).padStart(3, '0');
    return `Student_${suffix}`;
}

function getConversationId(userA, userB) {
    const sorted = [String(userA), String(userB)].sort();
    return `${sorted[0]}::${sorted[1]}`;
}

function detectModerationSignals(message = '') {
    const text = String(message || '').toLowerCase();
    const categories = Object.entries(MODERATION_PATTERNS)
        .filter(([, patterns]) => patterns.some((pattern) => text.includes(pattern)))
        .map(([category]) => category);

    if (!categories.length) {
        return {
            flagged: false,
            categories: [],
            empatheticResponse: '',
            supportResources: [],
        };
    }

    return {
        flagged: true,
        categories,
        empatheticResponse: 'Thank you for sharing this. What you are feeling matters, and you deserve support right now. If you are in immediate danger, please contact emergency services or a crisis helpline immediately.',
        supportResources: SUPPORT_RESOURCES,
    };
}

function serializePost(postDoc, viewerUserId = 'anonymous-device', extras = {}) {
    return {
        id: String(postDoc._id),
        userId: postDoc.userId,
        anonymousUsername: getAnonymousDisplayName(postDoc.userId),
        message: postDoc.message,
        mood: postDoc.mood || '',
        createdAt: postDoc.createdAt,
        canDelete: String(postDoc.userId) === String(viewerUserId),
        ...extras,
    };
}

function serializeReply(replyDoc, viewerUserId = 'anonymous-device') {
    return {
        id: String(replyDoc._id),
        postId: String(replyDoc.postId),
        userId: replyDoc.userId,
        anonymousUsername: getAnonymousDisplayName(replyDoc.userId),
        message: replyDoc.message,
        createdAt: replyDoc.createdAt,
        canDelete: String(replyDoc.userId) === String(viewerUserId),
    };
}

function serializeMessage(messageDoc, viewerUserId = 'anonymous-device') {
    return {
        id: String(messageDoc._id),
        senderId: messageDoc.senderId,
        receiverId: messageDoc.receiverId,
        conversationId: messageDoc.conversationId,
        message: messageDoc.message,
        timestamp: messageDoc.createdAt,
        anonymousSender: getAnonymousDisplayName(messageDoc.senderId),
        anonymousReceiver: getAnonymousDisplayName(messageDoc.receiverId),
        isMine: String(messageDoc.senderId) === String(viewerUserId),
    };
}

router.get('/posts', async (req, res) => {
    const userId = req.query.userId || 'anonymous-device';
    const filter = req.query.filter || 'all';

    try {
        if (filter === 'saved') {
            const saved = await SavedPost.find({ userId }).select('postId').lean();
            const savedIds = saved.map((item) => item.postId);
            const posts = await Post.find({ _id: { $in: savedIds } }).sort({ createdAt: -1 }).lean();
            const replies = await Reply.aggregate([
                { $match: { postId: { $in: posts.map((p) => p._id) } } },
                { $group: { _id: '$postId', count: { $sum: 1 } } },
            ]);
            const replyCountMap = new Map(replies.map((r) => [String(r._id), r.count]));

            return res.json({
                posts: posts.map((post) => serializePost(post, userId, {
                    replyCount: replyCountMap.get(String(post._id)) || 0,
                    saved: true,
                    moderation: post.moderation,
                })),
            });
        }

        const query = filter === 'mine' ? { userId } : {};
        const posts = await Post.find(query).sort({ createdAt: -1 }).lean();

        const saved = await SavedPost.find({ userId }).select('postId').lean();
        const savedSet = new Set(saved.map((item) => String(item.postId)));
        const replies = await Reply.aggregate([
            { $match: { postId: { $in: posts.map((p) => p._id) } } },
            { $group: { _id: '$postId', count: { $sum: 1 } } },
        ]);
        const replyCountMap = new Map(replies.map((r) => [String(r._id), r.count]));

        return res.json({
            posts: posts.map((post) => serializePost(post, userId, {
                replyCount: replyCountMap.get(String(post._id)) || 0,
                saved: savedSet.has(String(post._id)),
                moderation: post.moderation,
            })),
        });
    } catch (error) {
        console.error('Community posts list error:', error);
        return res.status(500).json({ error: 'Failed to load posts' });
    }
});

router.post('/posts', async (req, res) => {
    const { userId = 'anonymous-device', message = '', mood = '' } = req.body || {};

    if (!String(message).trim()) {
        return res.status(400).json({ error: 'message is required' });
    }

    try {
        const moderation = detectModerationSignals(message);
        const created = await Post.create({
            userId,
            message: String(message).trim(),
            mood: String(mood || '').trim(),
            moderation,
        });

        return res.status(201).json({
            post: serializePost(created, userId, {
                replyCount: 0,
                saved: false,
                moderation,
            }),
            moderation,
        });
    } catch (error) {
        console.error('Create post error:', error);
        return res.status(500).json({ error: 'Failed to create post' });
    }
});

router.delete('/posts/:postId', async (req, res) => {
    const userId = req.query.userId || req.body.userId || 'anonymous-device';
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (String(post.userId) !== String(userId)) {
            return res.status(403).json({ error: 'You can only delete your own posts' });
        }

        await Promise.all([
            Reply.deleteMany({ postId: post._id }),
            SavedPost.deleteMany({ postId: post._id }),
            Post.deleteOne({ _id: post._id }),
        ]);

        return res.json({ success: true });
    } catch (error) {
        console.error('Delete post error:', error);
        return res.status(500).json({ error: 'Failed to delete post' });
    }
});

router.get('/posts/:postId', async (req, res) => {
    const userId = req.query.userId || 'anonymous-device';
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    try {
        const post = await Post.findById(postId).lean();
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const [saved, replies] = await Promise.all([
            SavedPost.findOne({ userId, postId }).lean(),
            Reply.find({ postId }).sort({ createdAt: 1 }).lean(),
        ]);

        return res.json({
            post: serializePost(post, userId, {
                saved: Boolean(saved),
                replyCount: replies.length,
                moderation: post.moderation,
            }),
            replies: replies.map((reply) => serializeReply(reply, userId)),
        });
    } catch (error) {
        console.error('Post detail error:', error);
        return res.status(500).json({ error: 'Failed to load post details' });
    }
});

router.post('/posts/:postId/replies', async (req, res) => {
    const { userId = 'anonymous-device', message = '' } = req.body || {};
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    if (!String(message).trim()) {
        return res.status(400).json({ error: 'message is required' });
    }

    try {
        const post = await Post.findById(postId).lean();
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const moderation = detectModerationSignals(message);
        const reply = await Reply.create({
            postId,
            userId,
            message: String(message).trim(),
            moderation,
        });

        return res.status(201).json({
            reply: serializeReply(reply, userId),
            moderation,
        });
    } catch (error) {
        console.error('Create reply error:', error);
        return res.status(500).json({ error: 'Failed to create reply' });
    }
});

router.post('/posts/:postId/save', async (req, res) => {
    const userId = req.body.userId || 'anonymous-device';
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    try {
        await SavedPost.updateOne(
            { userId, postId },
            { $setOnInsert: { userId, postId } },
            { upsert: true }
        );
        return res.json({ success: true });
    } catch (error) {
        console.error('Save post error:', error);
        return res.status(500).json({ error: 'Failed to save post' });
    }
});

router.delete('/posts/:postId/save', async (req, res) => {
    const userId = req.query.userId || req.body.userId || 'anonymous-device';
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ error: 'Invalid post id' });
    }

    try {
        await SavedPost.deleteOne({ userId, postId });
        return res.json({ success: true });
    } catch (error) {
        console.error('Unsave post error:', error);
        return res.status(500).json({ error: 'Failed to unsave post' });
    }
});

router.get('/messages', async (req, res) => {
    const userId = req.query.userId || 'anonymous-device';

    try {
        const messages = await DirectMessage.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        }).sort({ createdAt: -1 }).lean();

        const seen = new Set();
        const conversations = [];

        messages.forEach((item) => {
            if (seen.has(item.conversationId)) return;
            seen.add(item.conversationId);

            const peerId = String(item.senderId) === String(userId) ? item.receiverId : item.senderId;
            conversations.push({
                conversationId: item.conversationId,
                peerId,
                peerAnonymousUsername: getAnonymousDisplayName(peerId),
                lastMessage: item.message,
                timestamp: item.createdAt,
            });
        });

        return res.json({ conversations });
    } catch (error) {
        console.error('Messages list error:', error);
        return res.status(500).json({ error: 'Failed to load messages' });
    }
});

router.get('/messages/:peerId', async (req, res) => {
    const userId = req.query.userId || 'anonymous-device';
    const { peerId } = req.params;

    try {
        const conversationId = getConversationId(userId, peerId);
        const history = await DirectMessage.find({ conversationId }).sort({ createdAt: 1 }).lean();

        return res.json({
            peerId,
            peerAnonymousUsername: getAnonymousDisplayName(peerId),
            messages: history.map((item) => serializeMessage(item, userId)),
        });
    } catch (error) {
        console.error('Message history error:', error);
        return res.status(500).json({ error: 'Failed to load message history' });
    }
});

router.post('/messages', async (req, res) => {
    const { senderId = 'anonymous-device', receiverId, message = '' } = req.body || {};

    if (!receiverId) {
        return res.status(400).json({ error: 'receiverId is required' });
    }

    if (!String(message).trim()) {
        return res.status(400).json({ error: 'message is required' });
    }

    try {
        const conversationId = getConversationId(senderId, receiverId);
        const moderation = detectModerationSignals(message);
        const created = await DirectMessage.create({
            senderId,
            receiverId,
            conversationId,
            message: String(message).trim(),
            moderation,
        });

        return res.status(201).json({
            directMessage: serializeMessage(created, senderId),
            moderation,
        });
    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
