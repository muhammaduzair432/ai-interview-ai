import express from "express";
import  {verifyJwt}  from "../middlewares/auth.middleware.js";
import  {uploadResume} from "../middlewares/multer.middleware.js";
import {
  generateInterViewReportController,
  getInterviewReportById,
  getUserInterviewReports,
} from "../controllers/interview.controller.js";
 
const interviewRoutes = express.Router();

interviewRoutes.post("/generateReport",
  verifyJwt,
  uploadResume.single("resume"),
  generateInterViewReportController
);

interviewRoutes.get("/my-reports",
  verifyJwt,
  getUserInterviewReports
);

interviewRoutes.get("/:interviewId",
  verifyJwt,
  getInterviewReportById
);


export default interviewRoutes;