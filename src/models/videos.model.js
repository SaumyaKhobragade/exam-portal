import mongoose, { Schema }  from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videosSchema = new mongoose.Schema({
    videoFile:{
        type:String,
        require: true,
    },
    thumbnail:{
        type:String,
        require: true,
    },
    title:{
        type: String,
        require: true,
    },
    description:{
        type: String,
        require: true,
    },
    duration:{
        type: Number,
        require: true,
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: false
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }

},
{timestamps: true});



videosSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model("Video", videosSchema);