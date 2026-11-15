
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";


const googleGenAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// 1. Zod schema for validating Gemini's response
const interviewReportSchema = z.object({
  title: z.string(),
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),
});

// 2. Gemini's native JSON response schema
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
    },

    matchScore: {
      type: Type.NUMBER,
    },

    technicalQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },

    behavioralQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },

    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          severity: {
            type: Type.STRING,
            enum: ["low", "medium", "high"],
          },
        },
        required: ["skill", "severity"],
      },
    },

    preparationPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          focus: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },

  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

// 3. Generate interview report
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert technical interviewer and career advisor.

Analyze the candidate's information carefully.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

Generate a detailed interview preparation report.

STRICT REQUIREMENTS:

1. title:
Identify the job title from the job description.

2. matchScore:
Calculate a realistic candidate-job match score between 0 and 100.

3. technicalQuestions:
Generate 8 technical interview questions relevant to the job.
Include question, intention, and detailed answer for each.

4. behavioralQuestions:
Generate 5 behavioral interview questions.
Include question, intention, and suggested answer for each.

5. skillGaps:
Identify at least 3 genuine skill gaps based on the resume
and job description.
Assign severity as low, medium, or high.

6. preparationPlan:
Generate a 7-day preparation plan.
Each day must include day, focus, and actionable tasks.

IMPORTANT:
- Return exactly the requested JSON structure.
- Do not return a resume summary.
- Do not return candidate_name, technical_skills,
  overall_rating, or recommendation.
- Do not leave any requested array empty.
- Base all recommendations on the supplied information.
`;

  console.log("Running INTERVIEW REPORT SERVICE V2");

  const response = await googleGenAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.3,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  console.log("Gemini Raw Response:", response.text);

  // 4. Convert Gemini JSON response into JavaScript object
  let result;

  try {
    result = JSON.parse(response.text);
  } catch (error) {
    throw new Error("Gemini returned invalid JSON.");
  }

  // 5. Validate the response using Zod
  const validatedResult = interviewReportSchema.parse(result);

  // 6. Prevent incomplete reports from being saved
  if (
    validatedResult.technicalQuestions.length === 0 ||
    validatedResult.behavioralQuestions.length === 0 ||
    validatedResult.skillGaps.length === 0 ||
    validatedResult.preparationPlan.length !== 7
  ) {
    throw new Error("Gemini returned an incomplete interview report.");
  }

  return validatedResult;
}

export {
  generateInterviewReport,
  interviewReportSchema,
};
