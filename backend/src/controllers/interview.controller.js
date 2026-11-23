
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Apierror.js";
import  InterviewReport  from "../models/interviewReport.model.js";
import {PDFParse} from "pdf-parse"; 
import puppeteer from "puppeteer";

import { generateInterviewReport } from "../services/ai.service.js";

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

async function generateResumePdf({ resume, jobDescription, selfDescription }) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 48px; color: #1e293b; font-family: Arial, sans-serif; line-height: 1.55; }
            h1 { margin: 0 0 8px; color: #0f172a; font-size: 28px; }
            h2 { margin: 28px 0 10px; border-bottom: 2px solid #2563eb; padding-bottom: 6px; color: #1d4ed8; font-size: 16px; }
            p { margin: 0 0 10px; white-space: pre-wrap; overflow-wrap: anywhere; }
          </style>
        </head>
        <body>
          <h1>Interview Resume</h1>
          <p>Generated resume document</p>
          <h2>Self Description</h2>
          <p>${escapeHtml(selfDescription || "Not provided")}</p>
          <h2>Target Job</h2>
          <p>${escapeHtml(jobDescription || "Not provided")}</p>
          <h2>Resume</h2>
          <p>${escapeHtml(resume || "Resume content unavailable")}</p>
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
    });
  } finally {
    await browser.close();
  }
}

async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;
    const interviewReport = await InterviewReport.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      throw new ApiError(404, "Interview report not found.");
    }

    const pdfBuffer = await generateResumePdf({
      resume: interviewReport.resume,
      jobDescription: interviewReport.jobDescription,
      selfDescription: interviewReport.selfDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Resume PDF Error:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error);
    }

    return res.status(500).json(
      new ApiError(500, error.message || "Failed to generate resume PDF.")
    );
  }
}

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
  generateResumePdfController,
};
