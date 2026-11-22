import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()
    const [fullname, setFullname] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [usernameError, setUsernameError] = useState("")
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState("")

    const { loading, handleRegister } = useAuth()

    useEffect(() => {
        if (!avatar) {
            setAvatarPreview("")
            return
        }

        const previewUrl = URL.createObjectURL(avatar)
        setAvatarPreview(previewUrl)
        return () => URL.revokeObjectURL(previewUrl)
    }, [avatar])

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")

        const hasLetter = /[A-Za-z]/.test(username)
        const hasNumber = /\d/.test(username)

        if (!hasLetter || !hasNumber) {
            setUsernameError("Username must contain at least one letter and one number.")
            return
        }

        setUsernameError("")

        setShowAvatarModal(true)
    }

    const completeRegistration = async () => {
        setError("")

        try {
            await handleRegister(username, email, password, fullname, avatar)
            setShowAvatarModal(false)
            navigate("/")
        } catch {
            setError("We could not create your account. Please try again.")
            setShowAvatarModal(false)
        }
    }

    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[560px_1fr] bg-slate-50 font-sans text-slate-800">
            <section className="flex min-h-screen w-full flex-col justify-center bg-white px-6 py-10 shadow-[18px_0_50px_rgba(31,48,82,0.08)] sm:px-12 lg:pl-20 lg:pr-14" aria-labelledby="register-title">
                <div className="mb-10 flex items-center gap-3 text-lg font-extrabold text-slate-900">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white" aria-hidden="true">AI</div>
                    <span>AI Interview</span>
                </div>

                <div className="mb-7">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Get started</p>
                    <h1 id="register-title" className="mb-3 text-4xl leading-tight font-black tracking-tight text-slate-900">Create your account</h1>
                    <p className="leading-relaxed text-slate-500">Start practicing interviews and improve with every session.</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700" htmlFor="fullname">Full name</label>
                        <input
                            value={fullname}
                            onChange={(event) => setFullname(event.target.value)}
                            type="text"
                            id="fullname"
                            name="fullname"
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                            className="h-[50px] w-full rounded-[10px] border border-slate-200 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700" htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(event) => {
                                setUsername(event.target.value)
                                if (usernameError) setUsernameError("")
                            }}
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                            aria-invalid={Boolean(usernameError)}
                            aria-describedby={usernameError ? "username-error" : undefined}
                            className={`h-[50px] w-full rounded-[10px] border px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${usernameError
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"
                            }`}
                        />
                        {usernameError && (
                            <p id="username-error" className="text-sm text-red-600" role="alert">
                                {usernameError}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700" htmlFor="email">Email address</label>
                        <input
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            className="h-[50px] w-full rounded-[10px] border border-slate-200 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            className="h-[50px] w-full rounded-[10px] border border-slate-200 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                        />
                    </div>

                    {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p>}

                    <button className="mt-1 h-[52px] rounded-[10px] border-0 bg-blue-600 text-[15px] font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:-translate-y-px hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link className="font-extrabold text-blue-600 no-underline" to="/login">Sign in</Link>
                </p>
            </section>

            <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 lg:block" aria-hidden="true">
                <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[42px] border border-white/25 shadow-[0_0_0_36px_rgba(255,255,255,0.05),0_0_0_72px_rgba(255,255,255,0.04)]"></div>
            </div>

            {showAvatarModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="avatar-modal-title"
                >
                    <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-8">
                        <button
                            type="button"
                            onClick={() => setShowAvatarModal(false)}
                            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close profile picture popup"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mb-6 pr-8">
                            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Make it yours</p>
                            <h2 id="avatar-modal-title" className="text-2xl font-black tracking-tight text-slate-900">Add a profile picture</h2>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">Upload a clear photo for your interview profile.</p>
                        </div>

                        <label
                            htmlFor="avatar"
                            className="group mx-auto flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                        >
                            {avatarPreview ? (
                                <div className="flex flex-col items-center">
                                    <img
                                        src={avatarPreview}
                                        alt="Selected profile preview"
                                        className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-[0_12px_30px_rgba(37,99,235,0.18)]"
                                    />
                                    <span className="mt-4 text-sm font-bold text-blue-700">Change profile picture</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition group-hover:-translate-y-1">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8" aria-hidden="true">
                                            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
                                            <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
                                        </svg>
                                    </span>
                                    <span className="mt-4 text-sm font-extrabold text-slate-800">Choose a photo</span>
                                    <span className="mt-1 text-xs text-slate-400">PNG, JPG or WEBP</span>
                                </div>
                            )}
                            <input
                                type="file"
                                id="avatar"
                                name="avatar"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                onChange={(event) => setAvatar(event.target.files?.[0] || null)}
                            />
                        </label>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            {!avatar ? (
                                <button
                                    type="button"
                                    onClick={completeRegistration}
                                    disabled={loading}
                                    className="h-[48px] flex-1 rounded-[10px] border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70 sm:flex-none"
                                >
                                    Skip
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={completeRegistration}
                                    disabled={loading}
                                    className="h-[48px] flex-1 rounded-[10px] border-0 bg-blue-600 px-8 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:-translate-y-px hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70 sm:flex-none"
                                >
                                    {loading ? "Creating account..." : "OK"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Register
