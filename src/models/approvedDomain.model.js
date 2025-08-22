import mongoose from "mongoose";

const approvedDomainSchema = new mongoose.Schema({
    domain: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    organizationName: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster domain lookups
approvedDomainSchema.index({ domain: 1, isActive: 1 });

const ApprovedDomain = mongoose.model("ApprovedDomain", approvedDomainSchema);

export default ApprovedDomain;
