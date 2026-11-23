
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Apierror.js";
import  InterviewReport  from "../models/interviewReport.model.js";
import {PDFParse} from "pdf-parse"; 

import { generateInterviewReport } from "../services/ai.service.js";

async function generateInterViewReportController(req, res) {
  try {
    // Check uploaded resume
    if (!req.file) {
      throw new ApiError(400, "Please upload your resume.");
    }

    const { selfDescription, jobDescription } = req.body;

    if (!selfDescription || !jobDescription) {
      throw new ApiError(
        400,
        "Self description and job description are required."
      );
    }

    // Extract text from PDF
    const pdf = new PDFParse(
      Uint8Array.from(req.file.buffer)
    );

    const resumeContent = await pdf.getText();

    if (!resumeContent.text?.trim()) {
      throw new ApiError(400, "Unable to extract text from resume.");
    }

    // Generate interview report using AI
    const interViewReportByAi = await generateInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
    });



console.log("========== GEMINI RESPONSE ==========");
console.log(JSON.stringify(interViewReportByAi, null, 2));
console.log("=====================================");

    // Save report in MongoDB (skip validation for testing)
const interviewReport = new InterviewReport({
  user: req.user.id,
  resume: resumeContent.text,
  selfDescription,
  jobDescription,
  ...interViewReportByAi,
});

await interviewReport.save({ validateBeforeSave: false });

// console.log("Resume text:", resumeContent.text);
// console.log("Resume text length:", resumeContent.text?.length);

    // Send success response
    return res.status(201).json(
      new ApiResponse(
        201,
        interviewReport,
        "Interview report generated successfully."
      )
    );

  } catch (error) {
    console.error("Interview Report Error:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error);
    }

    return res.status(500).json(
      new ApiError(
        500,
        error.message || "Failed to generate interview report."
      )
    );
  }
}

async function getInterviewReportById(req, res) {
 try {
   const report = await InterviewReport.findOne({
     _id: req.params.interviewId,
     user: req.user.id,
   });

   if (!report) {
     throw new ApiError(404, "Interview report not found.");
   }

   return res.status(200).json(
     new ApiResponse(200, report, "Interview report fetched successfully.")
   );
 } catch (error) {
   if (error instanceof ApiError) {
     return res.status(error.statusCode).json(error);
   }

   return res.status(500).json(
     new ApiError(500, error.message || "Failed to fetch interview report.")
   );
 }
}

async function getUserInterviewReports(req, res) {
  try {
    const reports = await InterviewReport.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume");

    return res.status(200).json(
      new ApiResponse(200, reports, "Interview reports fetched successfully.")
    );
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error.message || "Failed to fetch interview reports.")
    );
  }
}

export {
  generateInterViewReportController,
  getInterviewReportById,
  getUserInterviewReports,
};
