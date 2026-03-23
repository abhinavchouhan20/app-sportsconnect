import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBrain,
  FaComments,
  FaDumbbell,
  FaSearch,
  FaTrophy,
  FaUserTie,
} from "react-icons/fa";

const features = [
  {
    icon: <FaSearch />,
    title: "Discover talent fast",
    body: "Athletes showcase skills with video, data, and achievements. Coaches find the right fit with targeted filters.",
  },
  {
    icon: <FaBrain />,
    title: "AI scouting insights",
    body: "Surface power, speed, and accuracy signals with practical feedback that feels match-ready.",
  },
  {
    icon: <FaComments />,
    title: "Direct connection",
    body: "Move from discovery to conversation instantly with structured messaging and recruiting-friendly profiles.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative isolate">
        <div className="absolute inset-0 bg-hero" />
        <div className="absolute -left-10 top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-brand-mint/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col px-4 pb-20 pt-6 text-white sm:px-6 lg:px-8">
          <header className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <FaDumbbell />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">SportMatch</h1>
                <p className="text-sm text-white/80">Sports talent discovery platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-teal transition hover:bg-brand-soft"
              >
                Get Started
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <FaTrophy />
                Investor-ready product demo
              </div>
              <h2 className="mt-6 font-display text-5xl font-bold leading-tight sm:text-6xl">
                Connect with coaches.
                <span className="block text-brand-soft">Discover opportunities.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
                SportMatch helps ambitious athletes get discovered and gives coaches a modern scouting workflow with
                profiles, videos, AI analysis, and direct messaging in one polished experience.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-teal shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-soft"
                >
                  Get Started
                  <FaArrowRight />
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Demo Accounts
                </Link>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <p className="text-3xl font-bold">500+</p>
                  <p className="mt-2 text-sm text-white/80">Scouting clips ready to review</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <p className="text-3xl font-bold">42%</p>
                  <p className="mt-2 text-sm text-white/80">Faster athlete shortlisting</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="mt-2 text-sm text-white/80">Talent visibility across regions</p>
                </div>
              </div>
            </div>

            <div className="glass-card animate-float p-6 text-brand-dark shadow-2xl shadow-slate-900/10">
              <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Live scouting board</p>
                    <h3 className="mt-1 text-2xl font-bold">Today’s standout talent</h3>
                  </div>
                  <div className="rounded-2xl bg-brand-mint/20 p-3 text-brand-mint">
                    <FaUserTie />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["Maya Patel", "Cricket", "Power 9.0"],
                    ["Liam Carter", "Football", "Speed 9.0"],
                    ["Ava Chen", "E-Sports", "Accuracy 9.0"],
                  ].map(([name, sport, metric]) => (
                    <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{name}</p>
                          <p className="text-sm text-white/60">{sport}</p>
                        </div>
                        <span className="rounded-full bg-brand-mint/20 px-3 py-1 text-xs font-semibold text-brand-mint">
                          {metric}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="w-fit rounded-2xl bg-brand-soft p-3 text-brand-teal">{feature.icon}</div>
                    <h3 className="mt-4 font-semibold text-brand-dark">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
