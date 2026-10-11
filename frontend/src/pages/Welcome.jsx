
import { Link } from 'react-router'
import Brand from '../components/Brand'

function Welcome() {
  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#26352E]">
      <header className="border-b border-[#E4EAE3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Brand />

          <Link
            to="/login"
            className="rounded-full border border-[#DDE9D9] px-5 py-2.5 text-sm font-semibold text-[#174B38] transition hover:bg-[#F0F6EC]"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:min-h-[calc(100vh-150px)] lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-16">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#123D32] p-8 text-white sm:p-12 lg:min-h-[570px]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-10 h-52 w-52 rounded-full border border-white/10" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-[#D7E8D9]">
              <span className="h-2 w-2 rounded-full bg-[#C8F169]" />
              INTELLIGENT SOLAR MONITORING
            </div>

            <h1 className="mt-12 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              A brighter way to
              <span className="mt-2 block text-[#C8F169]">
                manage your energy.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#D0DED5]">
              Bring solar production, weather insights, and AI-powered
              forecasts together in one beautifully simple workspace.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#B7CEC0]">
                    YOUR ENERGY JOURNEY
                  </p>
                  <h2 className="mt-3 text-xl font-semibold">
                    Powered by the sun
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C8F169] text-3xl text-[#123D32]">
                  ☀
                </div>
              </div>

              <svg
                viewBox="0 0 440 160"
                className="mt-6 w-full"
                role="img"
                aria-label="Illustration of solar panels beneath the sun"
              >
                <circle cx="350" cy="35" r="20" fill="#C8F169" />

                <path
                  d="M0 112 Q100 50 210 112 T440 90 L440 160 L0 160 Z"
                  fill="#39845A"
                  opacity="0.45"
                />

                <path
                  d="M75 75 L275 75 L315 130 L55 130 Z"
                  fill="#174B38"
                  stroke="#A8D9A0"
                  strokeWidth="2"
                />

                <g stroke="#A8D9A0" strokeWidth="1.5">
                  <path d="M125 75 L112 130 M175 75 L175 130 M225 75 L238 130" />
                  <path d="M68 95 L290 95 M62 112 L302 112" />
                </g>
              </svg>

              <p className="mt-3 text-xs text-[#D0DED5]">
                Monitor. Understand. Optimize.
              </p>
            </div>
          </div>
        </section>

        <section className="py-4 lg:py-10">
          <p className="text-xs font-bold tracking-[0.18em] text-[#39845A]">
            SMARTER ENERGY STARTS HERE
          </p>

          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#183D30] sm:text-4xl">
            Make every ray of sunshine count.
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#748078]">
            Discover a simpler way to understand solar performance,
            explore energy trends, and make informed energy decisions.
          </p>

          <div className="mt-8 space-y-4">
            {[
              ['01', 'Monitor solar production', 'See energy generation and performance summaries.'],
              ['02', 'Understand your energy', 'Explore trends with clear, interactive charts.'],
              ['03', 'Plan with insights', 'Bring forecasts and solar analytics together.'],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-4 rounded-2xl border border-[#E3EAE0] bg-white p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6EA] text-sm font-bold text-[#247A58]">
                  {number}
                </div>

                <div>
                  <h3 className="font-semibold text-[#183D30]">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#748078]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174B38] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#174B38]/10 transition hover:-translate-y-0.5 hover:bg-[#103D2D]"
            >
              Get started
              <span>→</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-[#DDE9D9] bg-white px-7 py-4 text-sm font-semibold text-[#174B38] transition hover:bg-[#F0F6EC]"
            >
              I already have an account
            </Link>
          </div>

          <p className="mt-5 text-xs text-[#879188]">
            Your solar insights, thoughtfully brought together.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E4EAE3] bg-white px-6 py-5 text-center text-xs text-[#879188]">
        © 2026 GridPulse · Intelligent Solar Monitoring
      </footer>
    </div>
  )
}

export default Welcome
