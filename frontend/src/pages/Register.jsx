
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Brand from '../components/Brand'
import { register } from '../api'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  async function handleRegister(event) {
    event.preventDefault()
    setMessage('')
    setSuccess(false)

    if (password.length < 8) {
      setMessage('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.')
      return
    }

    setIsLoading(true)

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      setSuccess(true)
      setMessage('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      setSuccess(false)
      setMessage(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#26352E]">
      <header className="border-b border-[#E4EAE3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Brand />

          <Link
            to="/login"
            className="rounded-full border border-[#DDE9D9] px-4 py-2 text-sm font-semibold text-[#174B38] transition hover:bg-[#F0F6EC]"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-140px)] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-20 lg:px-10">
        {/* Left section */}
        <section className="relative hidden min-h-[570px] overflow-hidden rounded-[2rem] bg-[#123D32] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#39845A]/25 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-[#D7E8D9]">
              <span className="h-2 w-2 rounded-full bg-[#C8F169]" />
              INTELLIGENT SOLAR MONITORING
            </div>

            <h1 className="mt-9 text-4xl font-semibold leading-tight xl:text-5xl">
              Your journey to
              <span className="block text-[#C8F169]">
                smarter energy starts here.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#D0DED5]">
              Create your GridPulse account and bring solar production,
              energy insights, and intelligent forecasts together in
              one simple workspace.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C8F169] text-3xl text-[#123D32]">
                ☀
              </div>
              <div>
                <p className="text-lg font-semibold">
                  Make every ray count.
                </p>
                <p className="mt-1 text-sm text-[#B7CEC0]">
                  Monitor. Understand. Optimize.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-sm font-semibold text-[#C8F169]">01</p>
                <p className="mt-1 text-xs text-[#D0DED5]">Monitor</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-sm font-semibold text-[#C8F169]">02</p>
                <p className="mt-1 text-xs text-[#D0DED5]">Analyze</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-sm font-semibold text-[#C8F169]">03</p>
                <p className="mt-1 text-xs text-[#D0DED5]">Optimize</p>
              </div>
            </div>
          </div>

          <p className="relative z-10 border-t border-white/15 pt-5 text-xs text-[#B7CEC0]">
            GRIDPULSE © 2026 · Smarter insights. Sustainable choices.
          </p>
        </section>

        {/* Registration form */}
        <section className="mx-auto w-full max-w-md">
          <div className="mb-7 lg:hidden">
            <p className="text-xs font-bold tracking-[0.16em] text-[#39845A]">
              WELCOME TO GRIDPULSE
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#183D30]">
              Start your smarter energy journey.
            </h1>
          </div>

          <div className="rounded-[1.75rem] border border-[#E3EAE0] bg-white p-7 shadow-xl shadow-[#203D2C]/[0.06] sm:p-10">
            <div className="mb-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6EA] text-2xl text-[#247A58]">
                +
              </div>

              <p className="text-xs font-bold tracking-[0.16em] text-[#39845A]">
                CREATE YOUR ACCOUNT
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#183D30]">
                Join GridPulse
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#748078]">
                Set up your account to get started.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setMessage('')
                    setSuccess(false)
                  }}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] bg-[#FCFDFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A1AAA2] focus:border-[#39845A] focus:bg-white focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setMessage('')
                    setSuccess(false)
                  }}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] bg-[#FCFDFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A1AAA2] focus:border-[#39845A] focus:bg-white focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setMessage('')
                    setSuccess(false)
                  }}
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] bg-[#FCFDFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A1AAA2] focus:border-[#39845A] focus:bg-white focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#34463B]">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setMessage('')
                    setSuccess(false)
                  }}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] bg-[#FCFDFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A1AAA2] focus:border-[#39845A] focus:bg-white focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#65736A]">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 rounded accent-[#247A58]"
                />
                Show passwords
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#174B38]/10 transition duration-200 hover:-translate-y-0.5 hover:bg-[#103D2D] focus:outline-none focus:ring-4 focus:ring-[#174B38]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
                {!isLoading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              {message && (
                <p
                  role="status"
                  className={`rounded-xl border p-3 text-sm leading-6 ${
                    success
                      ? 'border-[#DDE9D9] bg-[#F3F8F0] text-[#247A58]'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {message}
                </p>
              )}
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E8EEE6]" />
              <span className="text-xs text-[#9AA39B]">ALREADY A MEMBER?</span>
              <div className="h-px flex-1 bg-[#E8EEE6]" />
            </div>

            <p className="text-center text-sm text-[#748078]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#247A58] transition hover:text-[#174B38]"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-[#879188]">
            Your smarter energy workspace starts here.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E4EAE3] bg-white px-6 py-5 text-center text-xs text-[#879188]">
        © 2026 GridPulse · Intelligent Solar Monitoring
      </footer>
    </div>
  )
}

export default Register
