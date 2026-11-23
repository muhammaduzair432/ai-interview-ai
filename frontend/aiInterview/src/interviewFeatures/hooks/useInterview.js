import { useContext } from "react"
import {
    generateInterviewReport,
    getInterviewReportById,
    getUserInterviewReports,
} from "../services/interview.api.js";
import { InterviewContext } from "../services/interview.context.jsx"
import {useParams} from "react-router-dom"



export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            const interviewReport = response.data || response.interviewReport
            setReport(interviewReport)
            setReports((current) => [
                interviewReport,
                ...current.filter((item) => item._id !== interviewReport._id),
            ])
            return interviewReport
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (id) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            const interviewReport = response.data || response.interviewReport || response
            setReport(interviewReport)
            return interviewReport
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getAllReports = async () => {
        try {
            const response = await getUserInterviewReports()
            const userReports = response.data || response.reports || response
            setReports(Array.isArray(userReports) ? userReports : [])
            return userReports
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    const getResumePdf = (id) => {
        const resumeText = report?.resume
        if (!resumeText) return

        const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `${report.title || "interview"}-resume.txt`
        anchor.click()
        URL.revokeObjectURL(url)
    }

    return {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
        generateReport,
        getReportById,
        getAllReports,
        getResumePdf,
    }
}