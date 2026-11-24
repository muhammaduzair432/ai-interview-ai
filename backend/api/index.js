import "dotenv/config";
import app from "../src/index.js";
import { connectdb } from "../src/ConfigDb/db.js";

let databaseReady;

export default async function handler(request, response) {
    if (!databaseReady) {
        databaseReady = connectdb().catch((error) => {
            databaseReady = undefined;
            throw error;
        });
    }
    await databaseReady;
    return app(request, response);
}
