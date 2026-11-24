import  express from "express";
import passport from "passport";
import  "./services/passport.js";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(cookieParser());
const allowedOrigins = [
    ...(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173")
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, "")),
    "http://localhost:5173",
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
}));

app.get("/", (req, res) => {
    res.status(200).json({ message: "AI Interview API is running" });
});

export {app};



// routes import 
import userRouter from "./routes/auth.route.js"
import authRoutes from "./routes/auth.route.js";
import interviewRoutes from "./routes/interview.route.js";
// routes decleration 
//  you cant directly use routes when you sepearted the things or setup or configuration like(seperated in different files ). so thats why you have to use middleware then you can create routes.
app.use("/api/v1/user",userRouter)
app.use("/api/auth", authRoutes);
app.use("/api/v1/interview", interviewRoutes);