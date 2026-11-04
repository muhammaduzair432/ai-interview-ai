import mongoose from "mongoose";

const DB_NAME = "ai-interview";
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`process.env.MONGO_DB_URI,${DB_NAME}`);  {
            console.log("Connected to MongoDB");
            console.log("database name:", connection.connect.DB_NAME);
        }
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
    
    }
