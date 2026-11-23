import express from "express";
import  {verifyJwt}  from "../middlewares/auth.middleware.js";
import  {uploadResume} from "../middlewares/multer.middleware.js";
import { generateInterViewReportController, getInterviewReportById } from "../controllers/interview.controller.js";
 
const interviewRoutes = express.Router();

interviewRoutes.post("/generateReport",
  verifyJwt,
  uploadResume.single("resume"),
  generateInterViewReportController
);

interviewRoutes.get("/:interviewId",
  verifyJwt,
  getInterviewReportById
);


export default interviewRoutes;