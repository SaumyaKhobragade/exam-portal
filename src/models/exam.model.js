import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true,
        trim: true
    },
    expectedOutput: {
        type: String,
        required: true,
        trim: true
    }
});

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    statement: {
        type: String,
        required: true,
        trim: true
    },
    inputFormat: {
        type: String,
        trim: true
    },
    outputFormat: {
        type: String,
        trim: true
    },
    constraints: {
        type: String,
        trim: true
    },
    weight: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
        default: 10
    },
    testCases: [testCaseSchema]
}, {
    timestamps: true
});

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    instructions: {
        type: String,
        trim: true
    },
    startDateTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 300 // in minutes
    },
    questions: [questionSchema],
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true,
        index: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        index: true
    },
    createdBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            enum: ['owner', 'admin'],
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'archived'],
        default: 'draft'
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        submittedAt: Date,
        score: Number,
        answers: [{
            questionId: mongoose.Schema.Types.ObjectId,
            code: String,
            testCaseResults: [{
                passed: Boolean,
                input: String,
                expectedOutput: String,
                actualOutput: String,
                executionTime: Number
            }]
        }]
    }],
    settings: {
        allowMultipleAttempts: {
            type: Boolean,
            default: false
        },
        showResultsImmediately: {
            type: Boolean,
            default: true
        },
        randomizeQuestions: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Calculate total marks when exam is saved
examSchema.pre('save', function(next) {
    if (this.questions && this.questions.length > 0) {
        this.totalMarks = this.questions.reduce((total, question) => total + question.weight, 0);
    }
    next();
});

// Index for efficient querying
examSchema.index({ ownerId: 1, status: 1 });
examSchema.index({ startDateTime: 1 });
examSchema.index({ title: 'text', description: 'text' });

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
