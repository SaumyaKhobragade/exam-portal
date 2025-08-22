import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const ownerSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        type:String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type:String,
        required: true,
        trim: true,
    },
    coverImage:{
        type:String,
    },
    password:{
        type:String,
        required: true,
    },
    refreshToken:{
        type: String,
    },
    role:{
        type: String,
        default: 'owner'
    },
    permissions:{
        type: [String],
        default: [
            'read', 'write', 'delete', 
            'manage_users', 'manage_admins', 'manage_exams',
            'create_admin', 'delete_admin', 'view_all_data',
            'system_settings', 'full_access'
        ]
    },
    createdAdmins:[{
        type: Schema.Types.ObjectId,
        ref: "Admin"
    }],
    isActive:{
        type: Boolean,
        default: true
    }
},{timestamps: true})

//! arrow function not used because it doesnt know context reference
//? pre is used to perform actions before saving document
ownerSchema.pre("save", async function(next){ 
    //? If password is not modified, skip hashing
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//? instance method to compare password
ownerSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

//? used to generate access token
ownerSchema.methods.generateAccess = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
            role: this.role,
            permissions: this.permissions
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    )
}

//? used to generate refresh token
ownerSchema.methods.generateRefresh = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    )
}

//? exporting model for owner
export default mongoose.model("Owner", ownerSchema);
