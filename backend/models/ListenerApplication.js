const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
    {
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        storageUrl: { type: String, default: '' },
    },
    { _id: false }
);

const ListenerApplicationSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        dateOfBirth: { type: Date, required: true },
        country: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true, index: true },
        phone: { type: String, required: true, trim: true },
        emailVerified: { type: Boolean, default: false },
        phoneVerified: { type: Boolean, default: false },

        educationLevel: { type: String, required: true, trim: true },
        fieldOfStudy: { type: String, required: true, trim: true },
        occupation: { type: String, required: true, trim: true },
        role: {
            type: String,
            enum: [
                'Psychology Student',
                'Social Worker',
                'NGO Volunteer',
                'Peer Support Volunteer',
                'Other',
            ],
            required: true,
        },
        motivation: { type: String, required: true, maxlength: 3000 },
        priorSupportExperience: { type: String, required: true, maxlength: 3000 },

        profileImage: { type: String, default: '' },

        identityDocument: {
            type: DocumentSchema,
            required: true,
        },

        trainingCompleted: { type: Boolean, default: false },
        trainingQuizScore: { type: Number, min: 0, max: 100, default: 0 },

        acceptedCodeOfConduct: { type: Boolean, default: false },

        applicationStatus: {
            type: String,
            enum: ['pending-review', 'approved', 'rejected', 'needs-info'],
            default: 'pending-review',
            index: true,
        },
        adminNotes: { type: String, default: '' },
        reviewedAt: { type: Date },

        completedSteps: {
            type: [Number],
            default: [],
        },
        currentStep: {
            type: Number,
            min: 1,
            max: 7,
            default: 6,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ListenerApplication', ListenerApplicationSchema);
