const express = require('express');
const mongoose = require('mongoose');

const Listener = require('../models/Listener');
const ListenerChat = require('../models/ListenerChat');
const ListenerApplication = require('../models/ListenerApplication');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_DOC_SIZE = 8 * 1024 * 1024;

function getConversationId(userId, listenerId) {
    return `${String(userId)}::${String(listenerId)}`;
}

function validateApplicationPayload(payload = {}) {
    const required = [
        'fullName',
        'dateOfBirth',
        'country',
        'state',
        'city',
        'email',
        'phone',
        'educationLevel',
        'fieldOfStudy',
        'occupation',
        'role',
        'motivation',
        'priorSupportExperience',
    ];

    const missing = required.filter((key) => !String(payload[key] || '').trim());
    if (missing.length) {
        return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    if (!payload.emailVerified || !payload.phoneVerified) {
        return { valid: false, error: 'Email OTP and phone OTP must be verified before submission.' };
    }

    const doc = payload.identityDocument || {};
    if (!doc.fileName || !doc.mimeType || !doc.size) {
        return { valid: false, error: 'Identity document is required.' };
    }

    if (!ALLOWED_DOC_TYPES.includes(doc.mimeType)) {
        return {
            valid: false,
            error: `Identity document type must be one of: ${ALLOWED_DOC_TYPES.join(', ')}`,
        };
    }

    if (Number(doc.size) > MAX_DOC_SIZE) {
        return { valid: false, error: 'Identity document exceeds max size (8 MB).' };
    }

    if (!payload.trainingCompleted || Number(payload.trainingQuizScore) < 70) {
        return { valid: false, error: 'Training must be completed and quiz score must be at least 70%.' };
    }

    if (!payload.acceptedCodeOfConduct) {
        return { valid: false, error: 'Code of conduct agreement is required.' };
    }

    return { valid: true };
}

function serializeListener(listener) {
    return {
        id: String(listener._id),
        name: listener.name,
        role: listener.role,
            profileImage: listener.profileImage || '',
        verificationStatus: listener.verificationStatus,
        trainingCompleted: listener.trainingCompleted,
        availabilityStatus: listener.availabilityStatus,
        createdAt: listener.createdAt,
    };
}

router.get('/listeners', async (req, res) => {
    const availability = req.query.availability;
    const status = req.query.verificationStatus || 'verified';

    try {
        const query = { verificationStatus: status };
        if (availability) {
            query.availabilityStatus = availability;
        }

        const listeners = await Listener.find(query).sort({ availabilityStatus: -1, createdAt: -1 }).lean();
        return res.json({ listeners: listeners.map(serializeListener) });
    } catch (error) {
        console.error('Fetch listeners error:', error);
        return res.status(500).json({ error: 'Failed to load listeners' });
    }
});

router.get('/listeners/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid listener id' });
    }

    try {
        const listener = await Listener.findById(id).lean();
        if (!listener) {
            return res.status(404).json({ error: 'Listener not found' });
        }

        // Get additional details from source application if available
        let applicationDetails = null;
        if (listener.sourceApplicationId) {
            const application = await ListenerApplication.findById(listener.sourceApplicationId).lean();
            if (application) {
                applicationDetails = {
                    motivation: application.motivation,
                    priorSupportExperience: application.priorSupportExperience,
                    educationLevel: application.educationLevel,
                    fieldOfStudy: application.fieldOfStudy,
                    occupation: application.occupation,
                };
            }
        }

        const profile = {
            id: String(listener._id),
            name: listener.name,
            role: listener.role,
            profileImage: listener.profileImage || '',
            verificationStatus: listener.verificationStatus,
            trainingCompleted: listener.trainingCompleted,
            availabilityStatus: listener.availabilityStatus,
            city: listener.city || '',
            state: listener.state || '',
            country: listener.country || '',
            createdAt: listener.createdAt,
            ...applicationDetails,
        };

        return res.json({ listener: profile });
    } catch (error) {
        console.error('Fetch listener profile error:', error);
        return res.status(500).json({ error: 'Failed to load listener profile' });
    }
});

router.patch('/listeners/:id/availability', async (req, res) => {
    const { id } = req.params;
    const { availabilityStatus } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid listener id' });
    }

    if (!['online', 'offline'].includes(String(availabilityStatus))) {
        return res.status(400).json({ error: 'availabilityStatus must be online or offline' });
    }

    try {
        const listener = await Listener.findByIdAndUpdate(
            id,
            { $set: { availabilityStatus } },
            { new: true }
        ).lean();

        if (!listener) {
            return res.status(404).json({ error: 'Listener not found' });
        }

        return res.json({ listener: serializeListener(listener) });
    } catch (error) {
        console.error('Update listener availability error:', error);
        return res.status(500).json({ error: 'Failed to update availability' });
    }
});

router.post('/listener-chat', async (req, res) => {
    const {
        userId = 'anonymous-device',
        listenerId,
        senderRole = 'user',
        message = '',
    } = req.body || {};

    if (!listenerId || !mongoose.Types.ObjectId.isValid(listenerId)) {
        return res.status(400).json({ error: 'Valid listenerId is required' });
    }

    if (!['user', 'listener', 'system'].includes(String(senderRole))) {
        return res.status(400).json({ error: 'senderRole must be user, listener, or system' });
    }

    if (!String(message).trim()) {
        return res.status(400).json({ error: 'message is required' });
    }

    try {
        const listener = await Listener.findById(listenerId).lean();
        if (!listener || listener.verificationStatus !== 'verified') {
            return res.status(404).json({ error: 'Verified listener not found' });
        }

        const conversationId = getConversationId(userId, listenerId);
        const created = await ListenerChat.create({
            conversationId,
            userId,
            listenerId,
            senderRole,
            message: String(message).trim(),
        });

        const payload = {
            id: String(created._id),
            conversationId,
            userId,
            listenerId: String(created.listenerId),
            senderRole: created.senderRole,
            message: created.message,
            createdAt: created.createdAt,
        };

        const io = req.app.get('io');
        if (io) {
            io.to(`user:${String(userId)}`).emit('listener-chat:new', { chatMessage: payload });
            io.to(`listener:${String(listenerId)}`).emit('listener-chat:new', { chatMessage: payload });
        }

        return res.status(201).json({ chatMessage: payload });
    } catch (error) {
        console.error('Create listener chat message error:', error);
        return res.status(500).json({ error: 'Failed to send listener chat message' });
    }
});

router.get('/listener-chat/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const history = await ListenerChat.find({ conversationId: id }).sort({ createdAt: 1 }).lean();
        return res.json({
            conversationId: id,
            messages: history.map((item) => ({
                id: String(item._id),
                conversationId: item.conversationId,
                userId: item.userId,
                listenerId: String(item.listenerId),
                senderRole: item.senderRole,
                message: item.message,
                createdAt: item.createdAt,
            })),
        });
    } catch (error) {
        console.error('Fetch listener chat error:', error);
        return res.status(500).json({ error: 'Failed to load listener chat history' });
    }
});

router.post('/listener-application', async (req, res) => {
    const payload = req.body || {};
    const validation = validateApplicationPayload(payload);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const application = await ListenerApplication.create({
            ...payload,
            completedSteps: [1, 2, 3, 4, 5, 6],
            currentStep: 6,
            applicationStatus: 'pending-review',
        });

        return res.status(201).json({
            application: {
                id: String(application._id),
                email: application.email,
                role: application.role,
                applicationStatus: application.applicationStatus,
                currentStep: application.currentStep,
            },
        });
    } catch (error) {
        console.error('Submit listener application error:', error);
        return res.status(500).json({ error: 'Failed to submit listener application' });
    }
});

router.get('/listener-applications', requireAdmin, async (req, res) => {
    try {
        const applications = await ListenerApplication.find({}).sort({ createdAt: -1 }).lean();
        return res.json({ applications });
    } catch (error) {
        console.error('Fetch listener applications error:', error);
        return res.status(500).json({ error: 'Failed to load listener applications' });
    }
});

router.patch('/listener-applications/:id/status', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid application id' });
    }

    if (!['approved', 'rejected', 'needs-info', 'pending-review'].includes(String(status))) {
        return res.status(400).json({ error: 'Invalid application status' });
    }

    try {
        const application = await ListenerApplication.findByIdAndUpdate(
            id,
            {
                $set: {
                    applicationStatus: status,
                    adminNotes: String(adminNotes || ''),
                    reviewedAt: new Date(),
                    currentStep: status === 'approved' ? 7 : 6,
                },
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        let listener = null;
        if (status === 'approved') {
            listener = await Listener.findOneAndUpdate(
                { sourceApplicationId: application._id },
                {
                    $set: {
                        name: application.fullName,
                        email: application.email,
                        phone: application.phone,
                        role: application.role,
                        verificationStatus: 'verified',
                        trainingCompleted: Boolean(application.trainingCompleted),
                        availabilityStatus: 'offline',
                        sourceApplicationId: application._id,
                        city: application.city,
                        state: application.state,
                        country: application.country,
                                            profileImage: application.profileImage || '',
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ).lean();
        }

        return res.json({
            application: {
                id: String(application._id),
                status: application.applicationStatus,
                currentStep: application.currentStep,
                reviewedAt: application.reviewedAt,
            },
            listener: listener ? serializeListener(listener) : null,
        });
    } catch (error) {
        console.error('Review listener application error:', error);
        return res.status(500).json({ error: 'Failed to update application status' });
    }
});

module.exports = router;
