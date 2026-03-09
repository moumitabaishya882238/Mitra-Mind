const mongoose = require('mongoose');

const ListenerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: [
                'Psychology Student',
                'Social Worker',
                'NGO Volunteer',
                'Peer Support Volunteer',
                'Other',
            ],
            default: 'Peer Support Volunteer',
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending',
            index: true,
        },
        trainingCompleted: {
            type: Boolean,
            default: false,
        },
        availabilityStatus: {
            type: String,
            enum: ['online', 'offline'],
            default: 'offline',
            index: true,
        },
        sourceApplicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ListenerApplication',
        },
        city: {
            type: String,
            default: '',
        },
        state: {
            type: String,
            default: '',
        },
        country: {
            type: String,
            default: '',
        },
        profileImage: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

ListenerSchema.index({ verificationStatus: 1, availabilityStatus: 1 });

module.exports = mongoose.model('Listener', ListenerSchema);
