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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));


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