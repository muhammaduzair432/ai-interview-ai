import "dotenv/config";
import  {app} from "./app.js";
import  {connectdb} from "./ConfigDb/db.js";
import { fileURLToPath } from "url";



const startServer = async () => {
    await connectdb();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

// if (process.argv[1] === fileURLToPath(import.meta.url)) {
    startServer().catch((error) => {
        console.error("mongodb connection error:", error);
        process.exit(1);
    });
// }

export default app;
