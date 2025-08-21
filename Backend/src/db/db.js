import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";

const connectDB = async () => {
    try {
        const connectionString = `${process.env.MONGO_URI}/${DB_NAME}`;
        console.log("Connecting to:", connectionString); // Debug log

        const connectionInstance = await mongoose.connect(connectionString);
        console.log("Database connected successfully:", connectionInstance.connection.name);
    } catch (error) {
        console.error("Database connection error:", error);
    }
};

export default connectDB;