import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"

const registerUser = asyncHandler(async (req,res)=>{
    const { username, email, password} = req.body;
    // console.log("Registering user:", { username, email, password });
    if(!username || !email || !password){
        throw new ApiError(400, "All fields are required");
    }
})

export { registerUser };