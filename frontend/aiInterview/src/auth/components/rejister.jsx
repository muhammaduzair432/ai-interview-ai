import { useState } from 'react'
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

    const { loading, handleRegister } = useAuth()

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

        try {
            await handleRegister(username, email, password, fullname)
            navigate("/")
        } catch {
            setError("We could not create your account. Please try again.")
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
        </main>
    )
}

export default Register
