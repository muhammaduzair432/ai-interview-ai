import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useInterview } from "../hooks/useInterview.js"
import { useAuth } from "../../auth/hooks/useAuth.js"

const navItems = [
    { id: "technical", label: "Technical questions" },
    { id: "behavioral", label: "Behavioral questions" },
    { id: "roadmap", label: "Preparation roadmap" },
]

const QuestionCard = ({ item, index, accent = "blue" }) => {
    const [open, setOpen] = useState(index === 0)

    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex w-full items-start gap-3 px-5 py-4 text-left"
                aria-expanded={open}
            >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-black ${accent === "blue" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
                    {index + 1}
                </span>
                <span className="min-w-0 flex-1 pt-1 text-sm font-extrabold leading-5 text-slate-900">{item.question}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`mt-2 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div className="grid gap-4 border-t border-slate-100 px-5 py-5 sm:grid-cols-[180px_1fr]">
                    <div>
                        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Intention</p>
                        <p className="text-sm leading-6 text-slate-500">{item.intention}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">Model answer</p>
                        <p className="text-sm leading-6 text-slate-700">{item.answer}</p>
                    </div>
                </div>
            )}
        </article>
    )
}

const Interview = () => {
    const [activeNav, setActiveNav] = useState("technical")
    const { report, getReportById, getResumePdf, loading } = useInterview()
    const { user, handleGetCurrentUser } = useAuth()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).catch(() => {})
        }
    }, [interviewId])

    useEffect(() => {
        if (!user) {
            handleGetCurrentUser().catch(() => {})
        }
    }, [])

    if (loading) {
        return (
            <main className="grid min-h-screen place-items-center bg-slate-50 font-sans">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="mt-4 text-sm font-bold text-slate-500">Loading your interview plan...</p>
                </div>
            </main>
        )
    }

    if (!report) {
        return (
            <main className="grid min-h-screen place-items-center bg-slate-50 px-6 font-sans">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <h1 className="text-xl font-black text-slate-900">Report unavailable</h1>
                    <p className="mt-2 text-sm text-slate-500">We could not load this interview report.</p>
                    <button type="button" onClick={() => navigate("/")} className="mt-5 h-11 rounded-lg bg-blue-600 px-5 text-sm font-extrabold text-white">
                        Back to dashboard
                    </button>
                </div>
            </main>
        )
    }

    const displayName = user?.fullname || user?.name || user?.username || "AI Candidate"
    const avatarInitial = displayName.trim().charAt(0).toUpperCase()
    const score = report.matchScore ?? 0

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 font-sans text-slate-800 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1440px]">
                <header className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:px-5">
                    <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white">AI</div>
                        <span className="hidden text-lg font-extrabold text-slate-900 sm:inline">AI Interview</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate("/")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-600">
                            Dashboard
                        </button>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="" className="h-10 w-10 rounded-full border-2 border-blue-200 object-cover" />
                        ) : (
                            <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-blue-200 bg-blue-50 text-sm font-black text-blue-600">{avatarInitial}</div>
                        )}
                    </div>
                </header>

                <section className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:px-8">
                    <div>
                        <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Interview strategy</p>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{report.title || "Custom interview plan"}</h1>
                        {report._id && <p className="mt-2 font-mono text-xs text-slate-400">Report ID: {report._id}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={() => getResumePdf(interviewId)}
                        className="h-11 rounded-lg border border-blue-600 px-4 text-sm font-extrabold text-blue-600 transition hover:bg-blue-50"
                    >
                        Download resume
                    </button>
                </section>

                <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)] xl:sticky xl:top-6">
                        <p className="px-3 pb-2 pt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Report sections</p>
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveNav(item.id)}
                                    className={`h-11 w-full rounded-lg px-3 text-left text-sm font-bold transition ${activeNav === item.id ? "bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)]" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
                        {activeNav === "technical" && (
                            <div>
                                <div className="mb-5 flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900">Technical questions</h2>
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{report.technicalQuestions?.length || 0} questions</span>
                                </div>
                                <div className="space-y-3">
                                    {(report.technicalQuestions || []).map((item, index) => (
                                        <QuestionCard key={index} item={item} index={index} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeNav === "behavioral" && (
                            <div>
                                <div className="mb-5 flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900">Behavioral questions</h2>
                                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">{report.behavioralQuestions?.length || 0} questions</span>
                                </div>
                                <div className="space-y-3">
                                    {(report.behavioralQuestions || []).map((item, index) => (
                                        <QuestionCard key={index} item={item} index={index} accent="violet" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeNav === "roadmap" && (
                            <div>
                                <div className="mb-5 flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900">Preparation roadmap</h2>
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{report.preparationPlan?.length || 0}-day plan</span>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {(report.preparationPlan || []).map((day) => (
                                        <article key={day._id || day.day} className="rounded-2xl border border-slate-200 p-5">
                                            <div className="mb-4 flex items-center gap-3">
                                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-blue-200 bg-blue-50 text-sm font-black text-blue-600">{day.day}</span>
                                                <div>
                                                    <p className="text-xs font-bold uppercase text-slate-400">Day {day.day}</p>
                                                    <h3 className="font-extrabold text-slate-900">{day.focus}</h3>
                                                </div>
                                            </div>
                                            <ul className="space-y-3">
                                                {day.tasks?.map((task, index) => (
                                                    <li key={index} className="flex gap-2.5 text-sm leading-6 text-slate-600">
                                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                                        {task}
                                                    </li>
                                                ))}
                                            </ul>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] xl:sticky xl:top-6">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Role match</p>
                        <div
                            className="mx-auto my-5 grid h-32 w-32 place-items-center rounded-full"
                            style={{ background: `conic-gradient(#2563eb ${score}%, #e2e8f0 0)` }}
                        >
                            <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-white text-center">
                                <div>
                                    <span className="block text-3xl font-black text-slate-900">{score}%</span>
                                    <span className="text-xs font-bold text-slate-400">Match score</span>
                                </div>
                            </div>
                        </div>
                        <p className="mb-5 text-center text-sm font-bold text-slate-600">{score >= 80 ? "Strong match for this role" : score >= 60 ? "Good foundation to build on" : "Focused preparation recommended"}</p>

                        <div className="border-t border-slate-100 pt-5">
                            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Skill gaps</p>
                            <div className="space-y-2">
                                {(report.skillGaps || []).map((gap, index) => (
                                    <div key={`${gap.skill}-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                                        <span className="text-xs font-bold leading-4 text-slate-700">{gap.skill}</span>
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${gap.severity === "high" ? "bg-red-500" : gap.severity === "medium" ? "bg-amber-500" : "bg-blue-500"}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    )
}

export default Interview
