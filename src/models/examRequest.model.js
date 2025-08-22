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
    examTitle: {
        type: String,
        required: true,
        trim: true
    },
    examDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 30,
        max: 480
    },
    expectedStudents: {
        type: Number,
        required: true,
        min: 1
    },
    examType: {
        type: String,
        required: true,
        enum: ['coding', 'mcq', 'mixed', 'theory']
    },
    requirements: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        required: true,
        trim: true
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
    },
    assignedAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Index for efficient querying
examRequestSchema.index({ status: 1, createdAt: -1 });
examRequestSchema.index({ organizationName: 1, status: 1 });

const ExamRequest = mongoose.model("ExamRequest", examRequestSchema);

export default ExamRequest;
