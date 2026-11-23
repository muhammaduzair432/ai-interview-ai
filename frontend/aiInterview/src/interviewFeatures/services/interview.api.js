import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1/interview",
  withCredentials: true,
});

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {

    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    if (resumeFile) formData.append("resume", resumeFile)

    const response = await api.post("/generateReport", formData)

    return response.data

}

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/${interviewId}`)
    return response.data
}

export const getUserInterviewReports = async () => {
    const response = await api.get("/my-reports")
    return response.data
}

export const downloadResumePdf = async (interviewReportId) => {
    const response = await api.get(`/resume/${interviewReportId}/pdf`, {
        responseType: "blob",
    })

    return response.data
}