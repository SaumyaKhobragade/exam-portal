import mongoose from "mongoose";

const homepageStatsSchema = new mongoose.Schema({
    studentsAssessed: {
        type: Number,
        default: 0,
        min: 0
    },
    institutions: {
        type: Number,
        default: 0,
        min: 0
    },
    uptime: {
        type: Number,
        default: 99.9,
        min: 0,
        max: 100
    },
    totalExams: {
        type: Number,
        default: 0,
        min: 0
    },
    activeUsers: {
        type: Number,
        default: 0,
        min: 0
    },
    heroTitle: {
        type: String,
        default: "Secure & Fair Online Coding Examinations",
        trim: true
    },
    heroDescription: {
        type: String,
        default: "The most advanced platform for conducting secure coding assessments with real-time monitoring, AI-powered proctoring, and comprehensive analytics.",
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only one active stats document exists
homepageStatsSchema.pre('save', async function(next) {
    if (this.isActive && this.isNew) {
        // Set all other documents to inactive
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { $set: { isActive: false } }
        );
    }
    next();
});

// Static method to get current active stats
homepageStatsSchema.statics.getCurrentStats = async function() {
    let stats = await this.findOne({ isActive: true });
    
    // If no active stats found, create default one
    if (!stats) {
        stats = new this({
            studentsAssessed: 0,
            institutions: 0,
            uptime: 99.9,
            totalExams: 0,
            activeUsers: 0,
            isActive: true
        });
        await stats.save();
    }
    
    return stats;
};

// Static method to get real-time stats from database
homepageStatsSchema.statics.getRealTimeStats = async function() {
    try {
        // Import models dynamically to avoid circular dependencies
        const User = mongoose.model('User');
        const Admin = mongoose.model('Admin');
        
        // Calculate real stats from database
        const totalUsers = await User.countDocuments();
        const totalAdmins = await Admin.countDocuments();
        
        // Get current stats document for other data (uptime, hero content)
        let stats = await this.getCurrentStats();
        
        // Try to get exam count, but don't fail if Exam model isn't available
        let totalExams = 0;
        try {
            const Exam = mongoose.model('Exam');
            totalExams = await Exam.countDocuments();
        } catch (examError) {
            console.log('Exam model not available, setting totalExams to 0');
        }
        
        // Return stats with real-time data
        return {
            studentsAssessed: totalUsers,
            institutions: totalAdmins, // Admins represent institutions
            uptime: stats.uptime,
            totalExams: totalExams,
            activeUsers: totalUsers + totalAdmins,
            heroTitle: stats.heroTitle,
            heroDescription: stats.heroDescription,
            isActive: stats.isActive,
            createdAt: stats.createdAt,
            updatedAt: stats.updatedAt,
            _id: stats._id
        };
    } catch (error) {
        console.error('Error fetching real-time homepage stats:', error);
        // Fallback to stored stats if real-time calculation fails
        return await this.getCurrentStats();
    }
};

// Method to calculate real-time stats from database
homepageStatsSchema.methods.updateFromDatabase = async function() {
    try {
        // Import models dynamically to avoid circular dependencies
        const User = mongoose.model('User');
        const Admin = mongoose.model('Admin');
        const Owner = mongoose.model('Owner');
        const Exam = mongoose.model('Exam');
        
        // Calculate real stats from database
        const totalUsers = await User.countDocuments();
        const totalAdmins = await Admin.countDocuments();
        const totalOwners = await Owner.countDocuments();
        const totalExams = await Exam.countDocuments();
        
        // Update stats
        this.studentsAssessed = totalUsers;
        this.institutions = totalOwners; // Owners represent institutions
        this.totalExams = totalExams;
        this.activeUsers = totalUsers + totalAdmins + totalOwners;
        
        await this.save();
        return this;
    } catch (error) {
        console.error('Error updating homepage stats from database:', error);
        return this;
    }
};

const HomepageStats = mongoose.model("HomepageStats", homepageStatsSchema);

export default HomepageStats;
