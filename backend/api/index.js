import "dotenv/config";
import app from "../src/index.js";
import { connectdb } from "../src/ConfigDb/db.js";

let databaseReady;

export default async function handler(request, response) {
    try {
        if (!databaseReady) {
            databaseReady = connectdb();
        }
        await databaseReady;
        return app(request, response);
    } catch (error) {
        console.error("Backend initialization failed:", error);
        return response.status(503).json({
            success: false,
            message: error.message || "Backend initialization failed",
        });
    }
}
