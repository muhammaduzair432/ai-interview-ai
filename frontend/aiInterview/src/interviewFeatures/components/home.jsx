import React, { useEffect, useRef, useState } from 'react'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth.js'

const Home = () => {
    const { loading, generateReport, reports, report, reportsLoading, getAllReports } = useInterview()
    const { user, handleGetUserProfile, handleLogout } = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeName, setResumeName] = useState("")
    const [resumeSize, setResumeSize] = useState("")
    const [reportSort, setReportSort] = useState("newest")
    const [error, setError] = useState("")
    const [profileOpen, setProfileOpen] = useState(false)
    const [reportsOpen, setReportsOpen] = useState(false)
    const resumeInputRef = useRef()
    const navbarRef = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            handleGetUserProfile().catch(() => {})
        }
    }, [])

    useEffect(() => {
        getAllReports().catch(() => {})
    }, [])

    useEffect(() => {
        const closeMenus = (event) => {
            if (!navbarRef.current?.contains(event.target)) {
                setProfileOpen(false)
                setReportsOpen(false)
            }
        }

        document.addEventListener("mousedown", closeMenus)
        return () => document.removeEventListener("mousedown", closeMenus)
    }, [])

    const handleLogoutClick = async () => {
        await handleLogout()
        navigate("/login")
    }

    const openReport = (reportId) => {
        setReportsOpen(false)
        navigate(`/interview/${reportId}`)
    }

    const allReports = report ? [report, ...reports.filter((item) => item._id !== report._id)] : reports
    const displayName = user?.fullname || user?.username || ""
    const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "?"

    const handleGenerateReport = async () => {
        setError("")

        if (!jobDescription.trim()) {
            setError("Add a job description to generate your interview plan.")
            return
        }

        const resumeFile = resumeInputRef.current?.files?.[0]
        if (!resumeFile && !selfDescription.trim()) {
            setError("Upload a resume or add a short self-description.")
            return
        }

        try {
            const generatedReport = await generateReport({ jobDescription, selfDescription, resumeFile })
            if (generatedReport?._id) {
                navigate(`/interview/${generatedReport._id}`)
            }
        } catch (generationError) {
            setError(generationError?.message || "We could not generate your interview plan. Please try again.")
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        setResumeName(file?.name || "")
        setResumeSize(file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "")
        setError("")
    }

    const removeResume = () => {
        if (resumeInputRef.current) resumeInputRef.current.value = ""
        setResumeName("")
        setResumeSize("")
    }

    const clearBuilder = () => {
        setJobDescription("")
        setSelfDescription("")
        removeResume()
        setError("")
    }

    const sortedReports = [...(report ? [report, ...reports.filter((item) => item._id !== report._id)] : reports)].sort((a, b) => {
        if (reportSort === "highest") return (b.matchScore ?? 0) - (a.matchScore ?? 0)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

    const getFocusTags = (item) => {
        const skillGaps = Array.isArray(item.skillGaps) ? item.skillGaps.map((gap) => gap.skill).filter(Boolean) : []
        const planItems = Array.isArray(item.preparationPlan) ? item.preparationPlan.map((entry) => entry.focus).filter(Boolean) : []
        return [...new Set([...skillGaps, ...planItems])].slice(0, 3)
    }

    return (
        <main className="min-h-screen bg-[#F6F8FC] px-4 py-8 font-sans text-slate-700 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <header ref={navbarRef} className="mb-8 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3 sm:px-5">
                    <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white">AI</div>
                        <span className="hidden text-lg font-extrabold text-slate-900 sm:inline">AI Interview</span>
                    </button>

                    <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main navigation">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setReportsOpen((open) => !open)
                                    setProfileOpen(false)
                                }}
                                className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                                aria-expanded={reportsOpen}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
                                <span className="hidden md:inline">Reports</span>
                                {allReports.length > 0 && (
                                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white">{allReports.length}</span>
                                )}
                            </button>

                            {reportsOpen && (
                                <div className="absolute right-0 top-12 z-30 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                                    <p className="px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Interview reports</p>
                                    {allReports.length === 0 ? (
                                        <p className="px-3 py-4 text-sm text-slate-500">No reports generated yet.</p>
                                    ) : (
                                        allReports.map((item) => (
                                            <button
                                                key={item._id}
                                                type="button"
                                                onClick={() => openReport(item._id)}
                                                className="w-full rounded-lg px-3 py-3 text-left transition hover:bg-slate-50"
                                            >
                                                <span className="block truncate text-sm font-bold text-slate-800">{item.title || "Untitled interview"}</span>
                                                <span className="mt-1 block font-mono text-[11px] text-slate-400">ID: {item._id}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen((open) => !open)
                                    setReportsOpen(false)
                                }}
                                className="flex items-center gap-2 rounded-xl border border-transparent p-1 pr-2 transition hover:border-slate-200 hover:bg-slate-50"
                                aria-expanded={profileOpen}
                                aria-label="Open user profile"
                            >
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={`${displayName || "User"} profile`}
                                        referrerPolicy="no-referrer"
                                        className="h-10 w-10 rounded-full border-2 border-blue-200 object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = "none"
                                        }}
                                    />
                                ) : (
                                    <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-blue-200 bg-blue-50 text-sm font-black text-blue-600">{avatarInitial}</div>
                                )}
                                <span className="hidden max-w-28 truncate text-sm font-extrabold text-slate-800 lg:block">{displayName}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden text-slate-400 sm:block"><polyline points="6 9 12 15 18 9" /></svg>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 top-14 z-30 w-[min(300px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                                    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={`${displayName || "User"} profile`}
                                                referrerPolicy="no-referrer"
                                                className="h-12 w-12 rounded-full border-2 border-blue-200 object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none"
                                                }}
                                            />
                                        ) : (
                                            <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-blue-200 bg-blue-50 text-lg font-black text-blue-600">{avatarInitial}</div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate font-extrabold text-slate-900">{displayName}</p>
                                            <p className="mt-1 truncate text-xs text-slate-500">{user?.email || ""}</p>
                                        </div>
                                    </div>

                                    <dl className="space-y-3 text-sm">
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Full name</dt>
                                            <dd className="mt-1 font-bold text-slate-700">{user?.fullname || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Username</dt>
                                            <dd className="mt-1 font-bold text-slate-700">@{user?.username || "—"}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</dt>
                                            <dd className="mt-1 break-all font-bold text-slate-700">{user?.email || "—"}</dd>
                                        </div>
                                    </dl>

                                    <button
                                        type="button"
                                        onClick={handleLogoutClick}
                                        className="mt-4 h-10 w-full rounded-lg border border-red-100 bg-red-50 text-sm font-extrabold text-red-600 transition hover:bg-red-100"
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </header>

                <section className="mb-8">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Interview planning</p>
                    <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        Create your <span className="animated-interview-text">custom interview strategy</span>
                    </h1>
                    <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">
                        Add the role you are targeting and either upload your resume or describe your experience.
                    </p>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <div className="grid lg:grid-cols-2">
                        <div className="border-b border-slate-200 p-6 lg:border-r lg:border-b-0 sm:p-8">
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </div>
                                    <h2 className="font-extrabold text-slate-900">Target job</h2>
                                </div>
                                <span className="text-xs font-bold text-slate-400">Target job *</span>
                            </div>
                        <textarea
                            value={jobDescription}
                            onChange={(event) => {
                                setJobDescription(event.target.value)
                                setError("")
                            }}
                            className="h-[330px] w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                            placeholder={"Paste the full job description here...\n\nFor example: responsibilities, required skills, technologies, and experience level."}
                            maxLength={5000}
                        />
                            <div className="mt-2 text-right font-mono text-xs font-semibold tabular-nums text-slate-400">
                                {jobDescription.length.toLocaleString()} / 5,000
                            </div>
                        </div>

                        <div className="p-6 sm:p-8">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <h2 className="font-extrabold text-slate-900">Your profile</h2>
                            </div>

                            <div className="mb-3 flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700" htmlFor="resume">Upload resume</label>
                                <span className="text-xs font-semibold text-slate-400">PDF, DOCX · up to 5 MB</span>
                            </div>
                            {resumeName ? (
                                <div className="flex min-h-20 items-center justify-between rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-extrabold text-slate-900">{resumeName}</p>
                                            <p className="mt-1 font-mono text-xs tabular-nums text-slate-500">{resumeSize}</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={removeResume} className="ml-3 text-sm font-bold text-slate-500 transition hover:text-red-600">Remove</button>
                                </div>
                            ) : (
                                <label htmlFor="resume" className="flex min-h-28 cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 transition hover:border-blue-400 hover:bg-[#EFF6FF]">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M12 3v12" />
                                            <path d="m7 10 5 5 5-5" />
                                            <path d="M5 21h14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-extrabold text-slate-700">Choose resume</p>
                                        <p className="mt-1 text-xs text-slate-400">PDF or DOCX, up to 5 MB</p>
                                    </div>
                                    <input ref={resumeInputRef} onChange={handleFileChange} hidden type="file" id="resume" name="resume" accept=".pdf,.docx,application/pdf" />
                                </label>
                            )}

                            <div className="my-4 flex items-center gap-3">
                                <span className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-semibold text-slate-400">or describe below</span>
                                <span className="h-px flex-1 bg-slate-200" />
                            </div>

                            <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="selfDescription">Quick self-description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(event) => {
                                    setSelfDescription(event.target.value)
                                    setError("")
                                }}
                                id='selfDescription'
                                name='selfDescription'
                                className="h-28 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                placeholder="Describe your experience, key skills, and years of experience..."
                            />
                        </div>
                    </div>

                    <footer className="flex flex-col items-stretch justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
                        <div>
                            {error ? (
                                <p className="text-sm font-bold text-red-600" role="alert">{error}</p>
                            ) : (
                                <p className="text-xs font-semibold text-slate-400">About 30 seconds · AI generation</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={clearBuilder} disabled={loading} className="h-[52px] rounded-[10px] px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50">
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateReport}
                                disabled={loading}
                                className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] border-0 bg-[#2563EB] px-6 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:-translate-y-px hover:bg-[#1D4ED8] disabled:cursor-wait disabled:opacity-75"
                            >
                            {loading ? (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="animate-pulse"
                                        aria-hidden="true"
                                    >
                                        <defs>
                                            <linearGradient id="gemini-loading-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#60A5FA" />
                                                <stop offset="0.5" stopColor="#FFFFFF" />
                                                <stop offset="1" stopColor="#A78BFA" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12C7.523 12 12 7.523 12 2Z" fill="url(#gemini-loading-gradient)" />
                                    </svg>
                                    <span>Generating your strategy...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <defs>
                                            <linearGradient id="gemini-button-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#93C5FD" />
                                                <stop offset="0.5" stopColor="#FFFFFF" />
                                                <stop offset="1" stopColor="#C4B5FD" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12C7.523 12 12 7.523 12 2Z" fill="url(#gemini-button-gradient)" />
                                    </svg>
                                    <span>Generate interview report </span>
                                </>
                            )}
                        </button>
                        </div>
                    </footer>
                </section>

                <section className="mt-8">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Dashboard</p>
                            <h2 className="text-2xl font-black text-slate-900">My interview reports</h2>
                        </div>
                        {reports.length > 0 && (
                            <select
                                value={reportSort}
                                onChange={(event) => setReportSort(event.target.value)}
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none transition focus:border-blue-600"
                                aria-label="Sort interview reports"
                            >
                                <option value="newest">Newest</option>
                                <option value="highest">Highest match</option>
                            </select>
                        )}
                    </div>

                    {reportsLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="mb-5 h-11 w-11 rounded-xl bg-slate-100" />
                                    <div className="h-5 w-2/3 rounded bg-slate-100" />
                                    <div className="mt-3 h-10 rounded bg-slate-100" />
                                    <div className="mt-5 h-px bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : sortedReports.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <h3 className="mt-4 font-extrabold text-slate-900">No interview reports yet</h3>
                            <p className="mt-1 text-sm text-slate-500">Generate your first report using the form above.</p>
                            <button type="button" onClick={() => document.querySelector("textarea")?.focus()} className="mt-5 h-10 rounded-lg bg-[#2563EB] px-4 text-sm font-extrabold text-white hover:bg-[#1D4ED8]">
                                Create your first report
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {sortedReports.map((item) => {
                                const matchScore = item.matchScore ?? 0
                                const scoreColor = matchScore >= 85
                                    ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#0F766E]"
                                    : "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
                                const focusTags = getFocusTags(item)

                                return (
                                <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => openReport(item._id)}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <h3 className="truncate pt-1 text-lg font-extrabold text-[#0F172A]">
                                            {item.title || "Untitled interview"}
                                        </h3>
                                        <span className={`shrink-0 rounded-md border px-2.5 py-1 font-mono text-xs font-black tabular-nums ${scoreColor}`}>
                                            {matchScore}% match
                                        </span>
                                    </div>
                                    {focusTags.length > 0 ? (
                                        <div className="flex min-h-7 flex-wrap gap-2">
                                            {focusTags.map((tag) => (
                                                <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">{tag}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="min-h-7 text-sm leading-6 text-slate-500">Personalized interview preparation</p>
                                    )}
                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently generated"}
                                        </span>
                                        <span className="text-sm font-extrabold text-[#2563EB]">View report </span>
                                    </div>
                                </button>
                                )
                            })}
                        </div>
                    )}
                </section>

            </div>
        </main>
    )
}

export default Home