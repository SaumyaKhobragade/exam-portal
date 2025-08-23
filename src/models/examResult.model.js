import mongoose from "mongoose";

const questionResultSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    questionTitle: {
        type: String,
        required: true
    },
    userCode: {
        type: String,
        default: ''
    },
    testResults: [{
        testCaseIndex: Number,
        passed: Boolean,
        expectedOutput: String,
        actualOutput: String,
        executionTime: Number,
        memoryUsed: Number
    }],
    score: {
        type: Number,
        default: 0,
        min: 0
    },
    maxScore: {
        type: Number,
        required: true,
        min: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
});

const examResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
        index: true
    },
    examTitle: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    timeTaken: {
        type: Number, // in minutes
        default: 0
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'timed_out', 'submitted'],
        default: 'in_progress'
    },
    totalScore: {
        type: Number,
        default: 0,
        min: 0
    },
    maxScore: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    questionsAttempted: {
        type: Number,
        default: 0,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 0
    },
    questionResults: [questionResultSchema],
    submissionData: {
        ipAddress: String,
        userAgent: String,
        browserFingerprint: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
examResultSchema.index({ userId: 1, examId: 1 });
examResultSchema.index({ userId: 1, createdAt: -1 });
examResultSchema.index({ status: 1, createdAt: -1 });

// Calculate percentage before saving
examResultSchema.pre('save', function(next) {
    if (this.maxScore > 0) {
        this.percentage = Math.round((this.totalScore / this.maxScore) * 100);
    }
    next();
});

// Static method to get user's exam statistics
examResultSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
        {
            $group: {
                _id: null,
                totalExams: { $sum: 1 },
                averageScore: { $avg: "$percentage" },
                totalTimeTaken: { $sum: "$timeTaken" },
                highestScore: { $max: "$percentage" },
                lowestScore: { $min: "$percentage" }
            }
        }
    ]);
    
    return stats.length > 0 ? stats[0] : {
        totalExams: 0,
        averageScore: 0,
        totalTimeTaken: 0,
        highestScore: 0,
        lowestScore: 0
    };
};

// Static method to get recent results for user
examResultSchema.statics.getRecentResults = async function(userId, limit = 5) {
    return await this.find({ 
        userId: new mongoose.Types.ObjectId(userId), 
        status: 'completed' 
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('examTitle totalScore maxScore percentage timeTaken questionsAttempted totalQuestions createdAt');
};

const ExamResult = mongoose.model('ExamResult', examResultSchema);

export default ExamResult;
