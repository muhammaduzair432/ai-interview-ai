import mongoose from "mongoose";

const DB_NAME = "ai-interview";
const connectdb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_DB_URI);  {
            console.log("Connected to MongoDB");
            // console.log("database name:", connection.connect.DB_NAME);
        }
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
    
    }
}
export  { connectdb };
