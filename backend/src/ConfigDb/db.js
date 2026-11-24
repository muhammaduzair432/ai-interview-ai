import mongoose from "mongoose";

const connectdb = async () => {
    try {
        console.log("Connecting to MongoDB");
        await mongoose.connect(process.env.MONGO_DB_URI, {
            serverSelectionTimeoutMS: 8000,
        });
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}
export  { connectdb };
