import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
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
    watchHistory:{
        type: Schema.Types.ObjectId,
        ref: "video",
    },
    password:{
        type:String,
        required: true,
    },
    refreshToken:{
        type: String,
    },
    // role removed


},{timestamps: true}
)


//! arrow function not used because it doesnt know context reference
//? pre is used to perform actions before saving document
userSchema.pre("save", async function(next){ 
    //? If password is not modified, skip hashing
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})


//? instance method to compare password
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

//? used to generate access token
userSchema.methods.generateAccess = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },

    )
}

//? used to generate refresh token
userSchema.methods.generateRefresh = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },

    )
}

//? exporting model for user
export default mongoose.model("User", userSchema);