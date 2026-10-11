
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Brand from '../components/Brand'
import { login } from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  async function handleLogin(event) {
    event.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (error) {
      setMessage(
        error.message ||
        'Cannot connect to the backend. Check that the backend server is running.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#26352E]">
      <header className="border-b border-[#E4EAE3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Brand />
          <a
            href="#login-form"
            className="rounded-full border border-[#DDE9D9] px-4 py-2 text-sm font-semibold text-[#174B38] transition hover:bg-[#F0F6EC]"
          >
            Sign in
          </a>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-150px)] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-16">
        <section className="relative hidden overflow-hidden rounded-[2rem] bg-[#123D32] p-10 text-white lg:flex lg:min-h-[590px] lg:flex-col lg:justify-between xl:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#39845A]/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-[#D7E8D9]">
              <span className="h-2 w-2 rounded-full bg-[#C8F169]" />
              INTELLIGENT SOLAR MONITORING
            </div>

            <h1 className="mt-9 max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              A brighter way to
              <span className="block text-[#C8F169]">
                manage your energy.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#D0DED5] xl:text-base">
              Bring solar production, weather insights, and AI-powered
              forecasts together in one beautifully simple workspace.
            </p>
          </div>

          <div className="relative z-10 my-10">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium tracking-wide text-[#B7CEC0]">
                    YOUR ENERGY JOURNEY
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Powered by the sun
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C8F169] text-2xl text-[#123D32]">
                  ☀
                </div>
              </div>

              <svg
                viewBox="0 0 440 145"
                className="mt-5 w-full"
                role="img"
                aria-label="Decorative illustration of solar panels beneath the sun"
              >
                <circle cx="348" cy="34" r="19" fill="#C8F169" />
                <path
                  d="M0 105 Q95 45 190 105 T440 83 L440 145 L0 145 Z"
                  fill="#39845A"
                  opacity="0.35"
                />
                <path
                  d="M0 126 Q100 75 220 119 T440 104 L440 145 L0 145 Z"
                  fill="#72B45B"
                  opacity="0.25"
                />
                <g stroke="#A8D9A0" strokeWidth="1.2" opacity="0.9">
                  <path d="M80 78 L252 78 L286 125 L64 125 Z" fill="#174B38" />
                  <path d="M122 78 L112 125 M164 78 L160 125 M207 78 L209 125" />
                  <path d="M73 91 L261 91 M68 108 L274 108" />
                </g>
                <path
                  d="M175 125 L170 139 M190 125 L195 139"
                  stroke="#A8D9A0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>

              <div className="flex items-center gap-2 text-xs text-[#D0DED5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8F169]" />
                Monitor. Understand. Optimize.
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-[#B7CEC0]">
            <span>Smarter insights. Sustainable choices.</span>
            <span>GRIDPULSE © 2026</span>
          </div>
        </section>

        <section
          id="login-form"
          className="mx-auto w-full max-w-md scroll-mt-8"
        >
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold tracking-wide text-[#39845A]">
              WELCOME TO GRIDPULSE
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#183D30]">
              Your energy insights,
              <span className="block text-[#39845A]">
                all in one place.
              </span>
            </h1>
          </div>

          <div className="rounded-[1.75rem] border border-[#E3EAE0] bg-white p-7 shadow-xl shadow-[#203D2C]/[0.06] sm:p-10">
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6EA] text-2xl">
                ↗
              </div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#39845A]">
                YOUR WORKSPACE
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#183D30]">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#748078]">
                Sign in to continue to your solar dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#34463B]"
                >
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
                  }}
                  required
                  className="w-full rounded-xl border border-[#DCE5DA] bg-[#FCFDFC] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#A1AAA2] focus:border-[#39845A] focus:bg-white focus:ring-4 focus:ring-[#39845A]/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#34463B]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setMessage('Password recovery is not configured yet.')
                    }
                    className="text-xs font-semibold text-[#39845A] transition hover:text-[#174B38]"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setMessage('')
                    }}
                    required
                    className="w-full rounded-xl border border-[#DCE5DA] bg-[#FCFDFC] px-4 py-3.5 pr-16 text-sm outline-none transition placeholder:text-[#A1AAA2] focus:border-[#39845A] focus:bg-white focus:ring-4 focus:ring-[#39845A]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 text-xs font-semibold text-[#65736A] hover:text-[#174B38]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#65736A]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded accent-[#247A58]"
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#174B38] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#174B38]/10 transition duration-200 hover:-translate-y-0.5 hover:bg-[#103D2D] focus:outline-none focus:ring-4 focus:ring-[#174B38]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Signing in...' : 'Sign in to GridPulse'}
                {!isLoading && (
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

              {message && (
                <p
                  role="status"
                  className="rounded-xl border border-[#DDE9D9] bg-[#F3F8F0] p-3 text-sm leading-6 text-[#247A58]"
                >
                  {message}
                </p>
              )}
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E8EEE6]" />
              <span className="text-xs text-[#9AA39B]">
                NEW TO GRIDPULSE?
              </span>
              <div className="h-px flex-1 bg-[#E8EEE6]" />
            </div>

            <p className="text-center text-sm text-[#748078]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#247A58] transition hover:text-[#174B38]"
              >
                Create account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-[#879188]">
            Secure access to your solar monitoring workspace.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E4EAE3] bg-white px-6 py-5 text-center text-xs text-[#879188]">
        © 2026 GridPulse · Intelligent Solar Monitoring
      </footer>
    </div>
  )
}

export default Login
