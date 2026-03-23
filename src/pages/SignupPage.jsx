import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaUserPlus } from "react-icons/fa";
import { sports } from "../data/mockData";
import { useApp } from "../context/AppContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useApp();
  const [form, setForm] = useState({
    role: "athlete",
    email: "",
    password: "",
    fullName: "",
    sport: "Cricket",
  });
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = signup(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-300/40 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-8 sm:p-12">
          <div className="w-fit rounded-2xl bg-brand-soft p-4 text-brand-teal">
            <FaUserPlus size={24} />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-brand-dark">Create your SportMatch profile</h1>
          <p className="mt-2 text-slate-500">Choose your role and launch into the full demo flow.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <span className="mb-3 block text-sm font-semibold text-slate-700">I am joining as</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {["athlete", "coach"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, role }))}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      form.role === role
                        ? "border-brand-teal bg-brand-soft text-brand-teal"
                        : "border-slate-200 text-slate-600 hover:border-brand-teal/30"
                    }`}
                  >
                    <p className="font-semibold capitalize">{role}</p>
                    <p className="mt-1 text-sm">
                      {role === "athlete" ? "Showcase your profile and clips." : "Scout athletes and build programs."}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Full Name</span>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-teal"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Sport</span>
                <select
                  value={form.sport}
                  onChange={(event) => setForm((current) => ({ ...current, sport: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-teal"
                >
                  {sports.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-teal"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-teal"
                required
              />
            </label>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-teal px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-teal">
              Log in
            </Link>
          </p>
        </div>

        <div className="bg-brand-dark p-10 text-white">
          <p className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm w-fit">Why teams love it</p>
          <h2 className="mt-8 font-display text-5xl font-bold leading-tight">Scouting and development in one flow.</h2>

          <div className="mt-10 space-y-4">
            {[
              "Role-based dashboards tuned for athletes and coaches",
              "AI analysis with performance visualization and feedback",
              "Messaging, challenges, and recruiting-style profile pages",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                <FaCheckCircle className="mt-1 text-brand-mint" />
                <p className="text-white/85">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
