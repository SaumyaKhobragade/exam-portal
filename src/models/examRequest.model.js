import mongoose from "mongoose";

const examRequestSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true,
        default: "Hosting access request"
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner'
    },
    reviewDate: {
        type: Date
    },
    reviewNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
examRequestSchema.index({ status: 1, createdAt: -1 });
examRequestSchema.index({ organizationName: 1, status: 1 });

const ExamRequest = mongoose.model("ExamRequest", examRequestSchema);

export default ExamRequest;
