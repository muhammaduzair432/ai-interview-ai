import  {app} from "./app.js";
import  {connectdb} from "./ConfigDb/db.js";
import  dotenv from "dotenv";
import dns from "dns";



// change dns 
dns.setServers(["1.1.1.1","8.8.8.8"]);


dotenv.config(
    {path:`./.env`}
);

// Test Gemini when server starts

connectdb().then(() => {
    app.listen({port: process.env.PORT}, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
    app.on("error", (error) => {
        console.log("Server error:", error);
        throw error;
    });
}).catch((error) => {
    console.error("mongodb connection error:", error);
});
