import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        const authError = searchParams.get("error")
        if (authError === "GoogleAuthFailed") {
            setError("Google authentication failed. Please try again.")
        } else if (authError === "ServerError") {
            setError("Unable to complete Google authentication. Please try again.")
        }
    }, [searchParams])

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/google"
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError("")
        setEmailError("")
        setPasswordError("")

        try {
            await handleLogin(email, password)
            navigate('/')
        } catch (error) {
            const status = error.response?.status
            const message = error.response?.data?.message

            if (status === 404 || /email|user.*not found/i.test(message || "")) {
                setEmailError("Email is incorrect or not registered.")
            } else if (status === 401 || /password|credentials/i.test(message || "")) {
                setPasswordError("Password is incorrect.")
            } else {
                setError(
                    message ||
                    "Unable to sign in. Check your connection and try again."
                )
            }
        }
    }

    return (
        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[560px_1fr] bg-slate-50 font-sans text-slate-800">
            <section className="flex min-h-screen w-full flex-col justify-center bg-white px-6 py-10 shadow-[18px_0_50px_rgba(31,48,82,0.08)] sm:px-12 lg:pl-20 lg:pr-14" aria-labelledby="login-title">
                <div className="mb-10 flex items-center gap-3 text-lg font-extrabold text-slate-900">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white" aria-hidden="true">AI</div>
                    <span>AI Interview</span>
                </div>

                <div className="mb-7">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Welcome back</p>
                    <h1 id="login-title" className="mb-3 text-4xl leading-tight font-black tracking-tight text-slate-900">Sign in to your account</h1>
                    <p className="leading-relaxed text-slate-500">Continue your interview preparation and track your progress.</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                            onInput={() => setEmailError("")}
                            className={`h-[50px] w-full rounded-[10px] border px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"}`}
                        />
                        {emailError && <p className="text-sm text-red-600" role="alert">{emailError}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            onInput={() => setPasswordError("")}
                            className={`h-[50px] w-full rounded-[10px] border px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/10"}`}
                        />
                        {passwordError && <p className="text-sm text-red-600" role="alert">{passwordError}</p>}
                    </div>

                    {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</p>}

                    <button className="mt-1 h-[52px] rounded-[10px] border-0 bg-blue-600 text-[15px] font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:-translate-y-px hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">or</span>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[10px] border border-blue-200 bg-blue-50 px-4 text-[15px] font-extrabold text-slate-700 shadow-sm transition hover:border-blue-600 hover:bg-blue-100 hover:shadow-[0_10px_24px_rgba(37,99,235,0.18)] focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.231c1.891-1.741 2.982-4.309 2.982-7.351Z"/>
                        <path fill="#34A853" d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.231-2.51c-.895.6-2.04.955-3.387.955-2.609 0-4.818-1.763-5.609-4.131H3.055v2.591A10 10 0 0 0 12 22Z"/>
                        <path fill="#FBBC05" d="M6.391 13.892A6.013 6.013 0 0 1 6.073 12c0-.655.113-1.293.318-1.892V7.517H3.055A10 10 0 0 0 2 12c0 1.614.386 3.143 1.055 4.483l3.336-2.591Z"/>
                        <path fill="#EA4335" d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.959 2.991 14.7 2 12 2a10 10 0 0 0-8.945 5.517l3.336 2.591C7.182 7.74 9.391 5.977 12 5.977Z"/>
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account? <Link className="font-extrabold text-blue-600 no-underline" to="/register">Create account</Link>
                </p>
            </section>

            <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 lg:block" aria-hidden="true">
                <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[42px] border border-white/25 shadow-[0_0_0_36px_rgba(255,255,255,0.05),0_0_0_72px_rgba(255,255,255,0.04)]"></div>
            </div>
        </main>
    )
}

export default Login