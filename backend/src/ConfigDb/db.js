import mongoose from "mongoose";

const DB_NAME = "ai-interview";
const connectdb = async () => {
    try {
        if (!process.env.MONGO_DB_URI) {
            throw new Error("MONGO_DB_URI is not configured");
        }
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}
export  { connectdb };
